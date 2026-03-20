const fs = require('fs');
const path = require('path');

const dir = 'f:/chat app/client/src';

function checkFiles(directory) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            checkFiles(fullPath);
        } else if (file.endsWith('.jsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const tags = content.match(/<([A-Z][a-zA-Z]*)/g);
            if (!tags) continue;
            
            const usedComponents = [...new Set(tags.map(t => t.slice(1)))];
            const imports = content.match(/import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/);
            const importedIcons = imports ? imports[1].split(',').map(i => i.split('as')[0].trim()) : [];
            
            // Also check other imports
            const otherImports = content.match(/import\s+([A-Z][a-zA-Z]*)\s+from/g) || [];
            const otherImported = otherImports.map(i => i.split(' ')[1]);

            for (const comp of usedComponents) {
                if (comp === 'React' || comp === 'Link' || comp === 'Navigate' || comp === 'Routes' || comp === 'Route' || comp === 'BrowserRouter' || comp === 'AuthProvider' || comp === 'ChatProvider' || comp === 'ProtectedRoute' || comp === 'PublicRoute' || comp === 'NotesSection' || comp === 'Sidebar' || comp === 'SearchModal' || comp === 'MainLayout' || comp === 'EditProfileModal') continue;
                
                if (!importedIcons.includes(comp) && !otherImported.includes(comp)) {
                    // Check if it's imported as an alias (User as UserIcon)
                    const aliased = content.includes(`${comp} as`) || content.includes(`as ${comp}`);
                    if (!aliased) {
                        console.log(`Missing import? File: ${file}, Component: ${comp}`);
                    }
                }
            }
        }
    }
}

checkFiles(dir);
