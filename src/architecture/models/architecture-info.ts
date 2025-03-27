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
    projectName: string;
    architecture: ArchitectureInfo;
    dependencies: { [key: string]: string };
    scripts: { [key: string]: string };
    mainFile: string | null;
    hasTests: boolean;
    repositoryUrl: string | null;
}