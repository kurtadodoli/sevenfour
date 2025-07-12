const fs = require('fs');

try {
  const content = fs.readFileSync('client/src/pages/TransactionPage.js', 'utf8');
  
  console.log('=== Replacing Design Requests ActionsContainer with Dropdown ===\n');

  // Find the ActionsContainer for design requests (around line 4047)
  const designActionsStart = content.indexOf('<ActionsContainer>\n                               {(request.status === \'pending\'');
  
  if (designActionsStart === -1) {
    // Try alternative pattern
    const altPattern = '<ActionsContainer>';
    const matches = [];
    let index = content.indexOf(altPattern);
    while (index !== -1) {
      matches.push(index);
      index = content.indexOf(altPattern, index + 1);
    }
    
    // Find the one that contains design request logic
    let designActionsStart2 = -1;
    for (const match of matches) {
      const snippet = content.substring(match, match + 1000);
      if (snippet.includes('processDesignRequest') && snippet.includes('custom_order_id')) {
        designActionsStart2 = match;
        break;
      }
    }
    
    if (designActionsStart2 === -1) {
      throw new Error('Could not find design requests ActionsContainer');
    }
    
    const designActionsEnd = content.indexOf('</ActionsContainer>', designActionsStart2) + '</ActionsContainer>'.length;
    
    // Create the new dropdown for design requests
    const designDropdown = `<div style={{ textAlign: 'center' }}>
                                <DropdownMenu className="dropdown-menu">
                                  <DropdownButton
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const requestKey = request.custom_order_id || request.id;
                                      setOpenDropdown(openDropdown === requestKey ? null : requestKey);
                                    }}
                                    title="Actions"
                                  >
                                    ⋮
                                  </DropdownButton>
                                  <DropdownContent show={openDropdown === (request.custom_order_id || request.id)}>
                                    {(request.status === 'pending' || request.status === 'Pending') && (
                                      <>
                                        <DropdownItem
                                          className="approve"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenDropdown(null);
                                            processDesignRequest(request.custom_order_id, 'approved');
                                          }}
                                          disabled={buttonLoading[\`design_\${request.custom_order_id}_approve\`] || buttonLoading[\`design_\${request.custom_order_id}_reject\`]}
                                        >
                                          {buttonLoading[\`design_\${request.custom_order_id}_approve\`] ? '⏳ Approving...' : '✅ Approve Design'}
                                        </DropdownItem>
                                        <DropdownItem
                                          className="reject"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenDropdown(null);
                                            processDesignRequest(request.custom_order_id, 'rejected');
                                          }}
                                          disabled={buttonLoading[\`design_\${request.custom_order_id}_approve\`] || buttonLoading[\`design_\${request.custom_order_id}_reject\`]}
                                        >
                                          {buttonLoading[\`design_\${request.custom_order_id}_reject\`] ? '⏳ Rejecting...' : '❌ Reject Design'}
                                        </DropdownItem>
                                      </>
                                    )}
                                    <DropdownItem
                                      className="view"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenDropdown(null);
                                        // Add logic to view design details in modal if needed
                                      }}
                                    >
                                      👁️ View Details
                                    </DropdownItem>
                                  </DropdownContent>
                                </DropdownMenu>
                              </div>`;

    // Replace the ActionsContainer
    const updatedContent = content.slice(0, designActionsStart2) + designDropdown + content.slice(designActionsEnd);

    // Write back to file
    fs.writeFileSync('client/src/pages/TransactionPage.js', updatedContent);
    
    console.log('✅ Replaced design requests ActionsContainer with dropdown');
    console.log('- Approve Design button in dropdown');
    console.log('- Reject Design button in dropdown');
    console.log('- View Details button in dropdown');
    console.log('- Conditional display based on request status');
    
  } else {
    throw new Error('Could not find specific design ActionsContainer pattern');
  }

} catch (error) {
  console.error('Error:', error.message);
}
