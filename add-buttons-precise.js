const fs = require('fs');
const path = require('path');

// Add approve/reject buttons after the Design Images section
const filePath = path.join(__dirname, 'client', 'src', 'pages', 'TransactionPage.js');

console.log('🔧 Adding Approve/Reject buttons after Design Images section...');

try {
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find the exact location after the Design Images InfoSection
    const searchPattern = `                                </InfoSection>
                              </ExpandedContent>
                            </ExpandedRowContainer>`;
    
    const replacement = `                                </InfoSection>
                                
                                {/* Approve/Reject Buttons for Custom Design Request */}
                                <InfoSection>
                                  <h4>Admin Actions</h4>
                                  <ActionsContainer style={{justifyContent: 'center', padding: '20px'}}>
                                    {(request.status === 'pending' || request.status === 'Pending' || true) && (
                                      <>
                                        <ActionButton
                                          variant="approve"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            processDesignRequest(request.id, 'approved');        
                                          }}
                                          loading={buttonLoading[\`design_\${request.id}_approve\`]}
                                          disabled={buttonLoading[\`design_\${request.id}_approve\`] || buttonLoading[\`design_\${request.id}_reject\`]}
                                          title="Approve Design Request"
                                          style={{marginRight: '10px', padding: '12px 24px', fontSize: '16px'}}
                                        >
                                          <FontAwesomeIcon icon={faCheck} style={{marginRight: '8px'}} />
                                          APPROVE
                                        </ActionButton>
                                        <ActionButton
                                          variant="reject"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            processDesignRequest(request.id, 'rejected');        
                                          }}
                                          loading={buttonLoading[\`design_\${request.id}_reject\`]} 
                                          disabled={buttonLoading[\`design_\${request.id}_approve\`] || buttonLoading[\`design_\${request.id}_reject\`]}
                                          title="Reject Design Request"
                                          style={{padding: '12px 24px', fontSize: '16px'}}
                                        >
                                          <FontAwesomeIcon icon={faTimes} style={{marginRight: '8px'}} />
                                          REJECT
                                        </ActionButton>
                                      </>
                                    )}
                                  </ActionsContainer>
                                </InfoSection>
                              </ExpandedContent>
                            </ExpandedRowContainer>`;
    
    // Check if the pattern exists
    if (content.includes(searchPattern)) {
        // Make the replacement
        const updatedContent = content.replace(searchPattern, replacement);
        
        // Write the file back
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        
        console.log('✅ Successfully added Approve/Reject buttons after Design Images section!');
        console.log('The buttons will now appear at the bottom of the Design Images section.');
    } else {
        console.log('❌ Could not find the exact pattern. Showing actual content around that area...');
        
        // Show what's actually there for debugging
        const lines = content.split('\n');
        for (let i = 4064; i < 4072; i++) {
            if (lines[i]) {
                console.log(`Line ${i + 1}: "${lines[i]}"`);
            }
        }
    }
    
} catch (error) {
    console.error('❌ Error adding buttons:', error.message);
}
