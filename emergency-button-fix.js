// EMERGENCY FIX: Create a patch to force buttons to appear

const fs = require('fs');
const path = require('path');

console.log('🚨 EMERGENCY BUTTON FIX IN PROGRESS...\n');

// Read the current TransactionPage.js file
const filePath = path.join(__dirname, 'client', 'src', 'pages', 'TransactionPage.js');

try {
    // Check if file exists and get its size
    const stats = fs.statSync(filePath);
    console.log(`📁 File size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
    
    if (stats.size > 50 * 1024 * 1024) {
        console.log('❌ File is too large to modify directly');
        console.log('💡 ALTERNATIVE SOLUTION: We need to create a separate patch file\n');
        
        // Create a patch file that can be manually applied
        const patchContent = `
// CUSTOM DESIGN BUTTONS PATCH
// Instructions: Add this code to your TransactionPage.js file

// 1. Find the line with: {request.status === 'pending' && (
// 2. Replace the entire ActionsContainer section with this code:

<ActionsContainer>
  {/* FORCED BUTTONS - ALWAYS SHOW FOR DEBUGGING */}
  <ActionButton
    variant="approve"
    onClick={(e) => {
      e.stopPropagation();
      console.log('🟢 APPROVE clicked for request:', request);
      processDesignRequest(request.id, 'approved');
    }}
    loading={buttonLoading[\`design_\${request.id}_approve\`]}
    disabled={buttonLoading[\`design_\${request.id}_approve\`] || buttonLoading[\`design_\${request.id}_reject\`]}
    title="Approve Design Request"
  >
    <FontAwesomeIcon icon={faCheck} />
  </ActionButton>
  
  <ActionButton
    variant="reject"
    onClick={(e) => {
      e.stopPropagation();
      console.log('🔴 REJECT clicked for request:', request);
      processDesignRequest(request.id, 'rejected');
    }}
    loading={buttonLoading[\`design_\${request.id}_reject\`]}
    disabled={buttonLoading[\`design_\${request.id}_approve\`] || buttonLoading[\`design_\${request.id}_reject\`]}
    title="Reject Design Request"
  >
    <FontAwesomeIcon icon={faTimes} />
  </ActionButton>
  
  <ActionButton
    variant="view"
    onClick={(e) => {
      e.stopPropagation();
      console.log('👁️ VIEW clicked for request:', request);
      // Add logic to view design details in modal if needed
    }}
  >
    <FontAwesomeIcon icon={faEye} />
  </ActionButton>
</ActionsContainer>

// Note: Remove the condition {request.status === 'pending' && (...)}
// This will force the buttons to ALWAYS show for debugging
`;
        
        fs.writeFileSync(path.join(__dirname, 'BUTTON_PATCH.txt'), patchContent);
        console.log('✅ Created BUTTON_PATCH.txt with manual instructions');
        
    } else {
        console.log('✅ File is small enough to read');
        // Could proceed with automatic patching
    }
    
} catch (error) {
    console.log('❌ Error accessing file:', error.message);
}

console.log('\n🎯 IMMEDIATE SOLUTIONS:\n');

console.log('SOLUTION 1: Manual Code Patch');
console.log('- Open client/src/pages/TransactionPage.js');
console.log('- Search for: {request.status === "pending" && (');
console.log('- Remove the condition to force buttons to always show');
console.log('- Or apply the patch from BUTTON_PATCH.txt\n');

console.log('SOLUTION 2: Browser Console Quick Fix');
console.log('Run this in your browser console (F12 → Console):');
console.log('```javascript');
console.log('// Force add buttons with a different approach');
console.log('setTimeout(() => {');
console.log('  const customOrderRow = Array.from(document.querySelectorAll("*")).find(el => ');
console.log('    el.textContent && el.textContent.includes("CUSTOM-MCS99QSP-O3ATI")');
console.log('  );');
console.log('  ');
console.log('  if (customOrderRow) {');
console.log('    console.log("Found custom order element:", customOrderRow);');
console.log('    ');
console.log('    // Find the parent table row');
console.log('    let tableRow = customOrderRow;');
console.log('    while (tableRow && !tableRow.tagName.match(/TR|DIV/)) {');
console.log('      tableRow = tableRow.parentElement;');
console.log('    }');
console.log('    ');
console.log('    if (tableRow) {');
console.log('      // Create actions container at the end');
console.log('      const actionsDiv = document.createElement("div");');
console.log('      actionsDiv.style.cssText = "position: absolute; right: 10px; top: 50%; transform: translateY(-50%); display: flex; gap: 8px; z-index: 1000;";');
console.log('      ');
console.log('      // Approve button');
console.log('      const approveBtn = document.createElement("button");');
console.log('      approveBtn.innerHTML = "✅";');
console.log('      approveBtn.title = "Approve Design Request";');
console.log('      approveBtn.style.cssText = "background: #27ae60; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer; font-size: 14px;";');
console.log('      approveBtn.onclick = async () => {');
console.log('        try {');
console.log('          const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");');
console.log('          const response = await fetch("/api/custom-orders/1/status", {');
console.log('            method: "PUT",');
console.log('            headers: {');
console.log('              "Content-Type": "application/json",');
console.log('              "Authorization": token ? `Bearer ${token}` : ""');
console.log('            },');
console.log('            body: JSON.stringify({status: "approved"})');
console.log('          });');
console.log('          const data = await response.json();');
console.log('          if (data.success) {');
console.log('            alert("✅ Design approved!");');
console.log('            location.reload();');
console.log('          } else {');
console.log('            alert("Error: " + data.message);');
console.log('          }');
console.log('        } catch (err) {');
console.log('          alert("Error: " + err.message);');
console.log('        }');
console.log('      };');
console.log('      ');
console.log('      // Reject button');
console.log('      const rejectBtn = document.createElement("button");');
console.log('      rejectBtn.innerHTML = "❌";');
console.log('      rejectBtn.title = "Reject Design Request";');
console.log('      rejectBtn.style.cssText = "background: #e74c3c; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer; font-size: 14px;";');
console.log('      rejectBtn.onclick = async () => {');
console.log('        if (confirm("Reject this design request?")) {');
console.log('          try {');
console.log('            const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");');
console.log('            const response = await fetch("/api/custom-orders/1/status", {');
console.log('              method: "PUT",');
console.log('              headers: {');
console.log('                "Content-Type": "application/json",');
console.log('                "Authorization": token ? `Bearer ${token}` : ""');
console.log('              },');
console.log('              body: JSON.stringify({status: "rejected"})');
console.log('            });');
console.log('            const data = await response.json();');
console.log('            if (data.success) {');
console.log('              alert("❌ Design rejected!");');
console.log('              location.reload();');
console.log('            } else {');
console.log('              alert("Error: " + data.message);');
console.log('            }');
console.log('          } catch (err) {');
console.log('            alert("Error: " + err.message);');
console.log('          }');
console.log('        }');
console.log('      };');
console.log('      ');
console.log('      actionsDiv.appendChild(approveBtn);');
console.log('      actionsDiv.appendChild(rejectBtn);');
console.log('      ');
console.log('      // Make row relative positioned');
console.log('      tableRow.style.position = "relative";');
console.log('      tableRow.appendChild(actionsDiv);');
console.log('      ');
console.log('      console.log("✅ Emergency buttons added!");');
console.log('    }');
console.log('  } else {');
console.log('    console.log("❌ Could not find custom order element");');
console.log('  }');
console.log('}, 1000);');
console.log('```\n');

console.log('SOLUTION 3: Direct API Calls');
console.log('You can approve/reject directly via browser console:');
console.log('```javascript');
console.log('// Get auth token');
console.log('const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");');
console.log('');
console.log('// Approve the design');
console.log('fetch("/api/custom-orders/1/status", {');
console.log('  method: "PUT",');
console.log('  headers: {');
console.log('    "Content-Type": "application/json",');
console.log('    "Authorization": `Bearer ${token}`');
console.log('  },');
console.log('  body: JSON.stringify({status: "approved"})');
console.log('}).then(r => r.json()).then(console.log);');
console.log('```\n');

console.log('🚀 TRY SOLUTION 2 FIRST - it should add visible buttons immediately!');
