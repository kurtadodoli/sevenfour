const fs = require('fs');
const path = require('path');

// Add approve/reject buttons after the Design Images section
const filePath = path.join(__dirname, 'client', 'src', 'pages', 'TransactionPage.js');

console.log('🔧 Adding Approve/Reject buttons after Design Images section...');

try {
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Split into lines for precise manipulation
    const lines = content.split('\n');
    
    // Find line 4064 (index 4063) which has the closing InfoSection
    const targetLineIndex = 4064; // This is line 4065 in 1-based indexing
    
    if (lines[targetLineIndex] && lines[targetLineIndex].includes('</InfoSection>')) {
        console.log('✅ Found target line:', lines[targetLineIndex]);
        
        // Insert the new Admin Actions section after the InfoSection but before ExpandedContent closes
        const newLines = [
            '                                ',
            '                                {/* Approve/Reject Buttons for Custom Design Request */}',
            '                                <InfoSection>',
            '                                  <h4>Admin Actions</h4>',
            '                                  <ActionsContainer style={{justifyContent: \'center\', padding: \'20px\'}}>',
            '                                    {(request.status === \'pending\' || request.status === \'Pending\' || true) && (',
            '                                      <>',
            '                                        <ActionButton',
            '                                          variant="approve"',
            '                                          onClick={(e) => {',
            '                                            e.stopPropagation();',
            '                                            processDesignRequest(request.id, \'approved\');        ',
            '                                          }}',
            '                                          loading={buttonLoading[`design_${request.id}_approve`]}',
            '                                          disabled={buttonLoading[`design_${request.id}_approve`] || buttonLoading[`design_${request.id}_reject`]}',
            '                                          title="Approve Design Request"',
            '                                          style={{marginRight: \'10px\', padding: \'12px 24px\', fontSize: \'16px\'}}',
            '                                        >',
            '                                          <FontAwesomeIcon icon={faCheck} style={{marginRight: \'8px\'}} />',
            '                                          APPROVE',
            '                                        </ActionButton>',
            '                                        <ActionButton',
            '                                          variant="reject"',
            '                                          onClick={(e) => {',
            '                                            e.stopPropagation();',
            '                                            processDesignRequest(request.id, \'rejected\');        ',
            '                                          }}',
            '                                          loading={buttonLoading[`design_${request.id}_reject`]} ',
            '                                          disabled={buttonLoading[`design_${request.id}_approve`] || buttonLoading[`design_${request.id}_reject`]}',
            '                                          title="Reject Design Request"',
            '                                          style={{padding: \'12px 24px\', fontSize: \'16px\'}}',
            '                                        >',
            '                                          <FontAwesomeIcon icon={faTimes} style={{marginRight: \'8px\'}} />',
            '                                          REJECT',
            '                                        </ActionButton>',
            '                                      </>',
            '                                    )}',
            '                                  </ActionsContainer>',
            '                                </InfoSection>'
        ];
        
        // Insert the new lines after the InfoSection line
        lines.splice(targetLineIndex + 1, 0, ...newLines);
        
        // Join back and write to file
        const updatedContent = lines.join('\n');
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        
        console.log('✅ Successfully added Approve/Reject buttons after Design Images section!');
        console.log('The buttons will now appear at the bottom of the Design Images section.');
        console.log('Restart your React dev server to see the changes.');
        
    } else {
        console.log('❌ Could not find the target line with </InfoSection>');
        console.log('Line content:', lines[targetLineIndex]);
    }
    
} catch (error) {
    console.error('❌ Error adding buttons:', error.message);
}
