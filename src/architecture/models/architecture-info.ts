export interface ArchitectureInfo {
    framework: 'Angular' | 'React' | 'Node.js' | 'Unknown';
    architectureType: string;
    folderStructure: FolderStructure;
    mainComponents: ComponentInfo[];
    characteristics: string[];
}

export interface FolderStructure {
    root: string;
    children: FolderItem[];
}

export interface FolderItem {
    name: string;
    type: 'file' | 'directory';
    children?: FolderItem[]; 
    description?: string;   
}

export interface ComponentInfo {
    name: string;
    type: string;
    path: string;
    purpose?: string;
}

export interface ProjectInfo {
    dependencies: { [key: string]: string };
    projectStructure: string[];
    architectureInfo: {
        framework: string;
        architectureType: string;
        folderStructure: FolderStructure;
        characteristics: string[];
    };
}