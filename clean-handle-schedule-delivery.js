// Fixed handleScheduleDelivery function with proper create/update logic
const handleScheduleDelivery = async (order, scheduleData) => {
  try {
    // Custom Order Production Timeline Validation (Admin-Controlled Dates)
    if (order.order_type === 'custom') {
      const now = new Date();
      const orderDate = new Date(order.created_at);
      const scheduledDate = new Date(scheduleData.date);
      
      // Get admin-controlled production completion date or default
      const adminSetCompletionDate = customOrderProductionDates[order.id];
      let completionDate;
      
      if (adminSetCompletionDate) {
        completionDate = new Date(adminSetCompletionDate);
      } else {
        // Default to 10 days if admin hasn't set a date
        completionDate = new Date(orderDate.getTime() + (10 * 24 * 60 * 60 * 1000));
      }
      
      const isProductionComplete = now >= completionDate;
      
      console.log(`📋 Custom order ${order.order_number} validation:`);
      console.log(`   - Order Created: ${orderDate.toLocaleDateString()}`);
      console.log(`   - Production Completion: ${completionDate.toLocaleDateString()} ${adminSetCompletionDate ? '(Admin Set)' : '(Default)'}`);
      console.log(`   - Scheduled Date: ${scheduledDate.toLocaleDateString()}`);
      console.log(`   - Production Complete: ${isProductionComplete}`);
      
      // Enforce production completion date for custom orders
      if (scheduledDate < completionDate) {
        showPopup(
          '🎨 Custom Order Production Schedule',
          `Production Timeline Restriction\n\n` +
          `Order Created: ${orderDate.toLocaleDateString()}\n` +
          `Production Completion: ${completionDate.toLocaleDateString()}${adminSetCompletionDate ? ' (Admin Set)' : ' (Default 10 days)'}\n` +
          `Requested Delivery: ${scheduledDate.toLocaleDateString()}\n\n` +
          `⚠️ SCHEDULING RESTRICTION:\n` +
          `Custom orders cannot be scheduled for delivery before production completion.\n` +
          `This order cannot be scheduled for delivery before ${completionDate.toLocaleDateString()}.\n\n` +
          `${!adminSetCompletionDate ? 'Admin can set a custom production completion date if needed.' : 'Production date was set by admin.'}`,
          'warning'
        );
        return; // Block scheduling if before production completion
      }
      
      // Production complete - allow scheduling
      console.log(`✅ Custom order ${order.order_number} ready for delivery scheduling`);
    }

    // Check production status and provide information
    const productionStatus = productionStatuses[order.id];
    if (productionStatus && productionStatus !== 'completed' && order.order_type !== 'custom') {
      const proceed = window.confirm(
        `Information: This order's production status is "${productionStatus}". While orders can be scheduled at any time, please note the current production status. Do you want to proceed with scheduling?`
      );
      if (!proceed) return;
    }

    // Check for conflicts
    const conflicts = checkScheduleConflicts(scheduleData);
    if (conflicts.length > 0) {
      // Check if the conflict is due to capacity limit
      const hasCapacityConflict = conflicts.some(conflict => conflict.includes('capacity exceeded'));
      if (hasCapacityConflict) {
        // Get suggested alternative dates
        const alternatives = getSuggestedAlternativeDates(scheduleData.date);
        const alternativeText = alternatives.length > 0 
          ? `\n\nSuggested alternative dates:\n${alternatives.map(date => `• ${date}`).join('\n')}`
          : '\n\nPlease check the calendar for available dates.';
        
        showPopup(
          'Schedule Conflict Detected',
          `${conflicts.join('\n')}\n\n⚠️ This date has reached maximum delivery capacity (3 deliveries).${alternativeText}`,
          'error'
        );
      } else {
        showPopup('Schedule Conflict Detected', conflicts.join('\n'), 'error');
      }
      return;
    }

    // Save delivery schedule to backend database
    console.log('📅 Scheduling delivery for order:', order.order_number);
    console.log('📅 Schedule data:', scheduleData);
    console.log('📅 Full order object:', order);
    
    // Get customer ID - handle different order types
    let customerId = null;
    if (order.user_id) {
      customerId = order.user_id;
    } else if (order.customer_id) {
      customerId = order.customer_id;
    } else {
      // For orders without customer ID, use a placeholder
      console.warn('⚠️ No customer ID found for order:', order.order_number);
      customerId = 1; // Default fallback
    }

    // Validate and prepare order_id (declare outside try block for scope access)
    let processedOrderId;
    if (order.id && order.id.toString().includes('-')) {
      // Extract numeric part from compound IDs
      const parts = order.id.split('-');
      processedOrderId = parseInt(parts[parts.length - 1]) || Math.floor(Math.random() * 1000000);
    } else if (order.id) {
      processedOrderId = parseInt(order.id) || Math.floor(Math.random() * 1000000);
    } else {
      // Generate a random order ID if none exists
      processedOrderId = Math.floor(Math.random() * 1000000);
    }

    // Create or update delivery schedule in the new delivery database
    try {
      console.log('💾 Saving delivery schedule to database...');
      
      // Ensure delivery_date is in proper format
      const deliveryDate = scheduleData.date;
      if (!deliveryDate) {
        throw new Error('Delivery date is required');
      }
      
      // Validate delivery address
      const deliveryAddress = order.shipping_address || order.address || order.customer_address || 'Address not provided';
      if (deliveryAddress === 'Address not provided') {
        console.warn('⚠️ Using fallback address for order:', order.order_number);
      }
      
      const deliveryScheduleData = {
        order_id: processedOrderId,
        order_type: order.order_type === 'custom_design' ? 'custom' : (order.order_type || 'regular'),
        customer_id: customerId,
        delivery_date: deliveryDate,
        delivery_time_slot: scheduleData.time || '9:00-17:00',
        delivery_address: deliveryAddress,
        delivery_city: order.city || order.shipping_city || 'Manila',
        delivery_postal_code: order.postal_code || order.shipping_postal_code || '1000',
        delivery_province: order.province || order.shipping_province || 'Metro Manila',
        delivery_contact_phone: order.contact_phone || order.customer_phone || order.phone || '',
        delivery_notes: scheduleData.notes || '',
        priority_level: (order.priority && order.priority > 50) ? 'high' : 'normal',
        delivery_fee: 150.00 // Standard delivery fee
      };
      
      console.log('📋 Delivery schedule data to send:', deliveryScheduleData);
      
      // Validate required fields before sending
      const requiredFields = ['order_id', 'customer_id', 'delivery_date', 'delivery_address', 'delivery_city'];
      const missingFields = requiredFields.filter(field => !deliveryScheduleData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Check if a delivery schedule already exists for this order
      const existingSchedule = deliverySchedules.find(schedule => 
        schedule.order_id === order.id || 
        schedule.order_number === order.order_number
      );

      let deliveryResponse;
      
      if (existingSchedule && existingSchedule.id) {
        // Update existing schedule
        console.log(`🔄 Updating existing delivery schedule ${existingSchedule.id} for order ${order.order_number}`);
        
        const updateData = {
          delivery_date: deliveryDate,
          delivery_time_slot: scheduleData.time || '9:00-17:00',
          delivery_notes: scheduleData.notes || '',
          delivery_status: 'scheduled'
        };
        
        deliveryResponse = await api.put(`/delivery/schedules/${existingSchedule.id}`, updateData);
        
        console.log('✅ Delivery schedule updated successfully');
        
        // Update local state
        setDeliverySchedules(prev => prev.map(schedule => 
          schedule.id === existingSchedule.id 
            ? {
                ...schedule,
                delivery_date: scheduleData.date,
                delivery_time: scheduleData.time,
                notes: scheduleData.notes,
                status: 'scheduled'
              }
            : schedule
        ));
        
      } else {
        // Create new schedule
        console.log(`➕ Creating new delivery schedule for order ${order.order_number}`);
        
        deliveryResponse = await api.post('/delivery/schedules', deliveryScheduleData);
        
        if (deliveryResponse.data && deliveryResponse.data.schedule) {
          console.log('✅ Delivery schedule created with ID:', deliveryResponse.data.schedule.id);
          
          // Add new schedule to local state
          const newSchedule = {
            id: deliveryResponse.data.schedule.id,
            order_id: order.id,
            order_number: order.order_number,
            customer_name: order.customerName,
            delivery_date: scheduleData.date,
            delivery_time: scheduleData.time,
            status: 'scheduled',
            notes: scheduleData.notes
          };
          
          setDeliverySchedules(prev => [...prev, newSchedule]);
        } else {
          throw new Error('Invalid response from delivery API');
        }
      }
      
    } catch (deliveryApiError) {
      console.error('❌ Failed to save delivery schedule to database:', deliveryApiError);
      
      if (deliveryApiError.response?.status === 400 && deliveryApiError.response?.data?.message?.includes('already exists')) {
        // Handle duplicate schedule error by trying to update instead
        console.log('🔄 Schedule already exists, attempting to fetch and update...');
        try {
          const allSchedules = await api.get('/delivery/schedules');
          const existingSchedule = allSchedules.data.find(schedule => 
            schedule.order_id === processedOrderId || schedule.order_number === order.order_number
          );
          
          if (existingSchedule) {
            const updateData = {
              delivery_date: scheduleData.date,
              delivery_time_slot: scheduleData.time || '9:00-17:00',
              delivery_notes: scheduleData.notes || '',
              delivery_status: 'scheduled'
            };
            
            await api.put(`/delivery/schedules/${existingSchedule.id}`, updateData);
            console.log('✅ Successfully updated existing delivery schedule');
            
            // Update local state
            setDeliverySchedules(prev => {
              const scheduleExists = prev.some(s => s.id === existingSchedule.id);
              if (scheduleExists) {
                return prev.map(schedule => 
                  schedule.id === existingSchedule.id 
                    ? {
                        ...schedule,
                        delivery_date: scheduleData.date,
                        delivery_time: scheduleData.time,
                        notes: scheduleData.notes,
                        status: 'scheduled'
                      }
                    : schedule
                );
              } else {
                // Add the schedule to local state if it wasn't there
                return [...prev, {
                  id: existingSchedule.id,
                  order_id: order.id,
                  order_number: order.order_number,
                  customer_name: order.customerName,
                  delivery_date: scheduleData.date,
                  delivery_time: scheduleData.time,
                  status: 'scheduled',
                  notes: scheduleData.notes
                }];
              }
            });
            
          } else {
            throw new Error('Could not find existing schedule to update');
          }
        } catch (retryError) {
          console.error('❌ Failed to handle duplicate schedule:', retryError);
          showPopup('Database Error', 'Failed to save delivery schedule. Please refresh the page and try again.', 'error');
          return;
        }
      } else {
        showPopup('Database Error', 'Failed to save delivery schedule to database. The schedule will be lost on refresh.', 'error');
        
        // Fallback: Add to local state only (will be lost on refresh)
        const newSchedule = {
          id: Date.now(),
          order_id: order.id,
          order_number: order.order_number,
          customer_name: order.customerName,
          delivery_date: scheduleData.date,
          delivery_time: scheduleData.time,
          status: 'scheduled',
          notes: scheduleData.notes
        };
        setDeliverySchedules(prev => [...prev, newSchedule]);
      }
    }

    // Update backend for custom orders (legacy support)
    if (order.order_type === 'custom' && order.id.toString().startsWith('custom-order-')) {
      try {
        const customOrderId = order.id.replace('custom-order-', '');
        await api.patch(`/custom-orders/${customOrderId}/delivery-status`, {
          delivery_status: 'scheduled',
          delivery_notes: `Scheduled for ${scheduleData.date} at ${scheduleData.time}. ${scheduleData.notes || ''}`
        });
        console.log(`✅ Successfully updated custom order ${order.order_number} to scheduled status`);
      } catch (apiError) {
        console.error('Failed to update custom order in database:', apiError);
        showPopup('Warning', 'Order scheduled but custom order status update failed.', 'warning');
      }
    } else if (order.order_type === 'custom_design' && order.custom_design_data) {
      try {
        const designId = order.custom_design_data.design_id;
        await api.patch(`/custom-designs/${designId}/delivery-status`, {
          delivery_status: 'scheduled',
          delivery_notes: `Scheduled for ${scheduleData.date} at ${scheduleData.time}. ${scheduleData.notes || ''}`
        });
        console.log(`✅ Successfully updated custom design ${designId} to scheduled status`);
      } catch (apiError) {
        console.error('Failed to update custom design in database:', apiError);
        showPopup('Warning', 'Design scheduled but status update failed.', 'warning');
      }
    }
    
    // Update frontend state
    const updatedOrder = { 
      ...order, 
      delivery_status: 'scheduled',
      scheduled_delivery_date: scheduleData.date,
      scheduled_delivery_time: scheduleData.time,
      delivery_notes: scheduleData.notes
    };
    
    setOrders(prevOrders => prevOrders.map(o => o.id === order.id ? updatedOrder : o));
    
    // Mock email notification
    console.log('📧 Email notification sent to:', order.user_email);
    
    setShowScheduleModal(false);
    setSelectedOrder(null);
    setSelectedDate(null);
    
    // Clear selected order for scheduling if it was the one just scheduled
    if (selectedOrderForScheduling && selectedOrderForScheduling.id === order.id) {
      setSelectedOrderForScheduling(null);
    }
    
    showPopup(
      'Delivery Scheduled Successfully',
      'Delivery scheduled successfully! Customer notification sent.',
      'success'
    );
    
  } catch (error) {
    console.error('Error scheduling delivery:', error);
    showPopup('Error', 'Error scheduling delivery. Please try again.', 'error');
  }
};
