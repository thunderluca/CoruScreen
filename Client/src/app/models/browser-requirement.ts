import { DevicePlatform } from "./device-platform";
import { OperatingSystem } from "./operating-system";

export class BrowserRequirement {
    public displayName: string;
    public feature: string;
    public names: string[];
    public operatingSystems: OperatingSystem[];
    public platforms: DevicePlatform[];
    public version: number;
    
    public static DEFAULT: BrowserRequirement[] = [
        // Coruscreen UX
        { displayName: 'Google Chrome', feature: 'app', names: ['chrome'], operatingSystems: [OperatingSystem.ChromeOS, OperatingSystem.Linux, OperatingSystem.MacOS, OperatingSystem.Windows], platforms: [DevicePlatform.Desktop], version: 56 },
        { displayName: 'Google Chrome', feature: 'app', names: ['chrome'], operatingSystems: [OperatingSystem.Android], platforms: [DevicePlatform.Mobile, DevicePlatform.Tablet, DevicePlatform.TV], version: 89 },
        { displayName: 'Microsoft Edge', feature: 'app', names: ['edge', 'microsoft edge'], operatingSystems: [OperatingSystem.Linux, OperatingSystem.MacOS, OperatingSystem.Windows], platforms: [DevicePlatform.Any], version: 79 },
        { displayName: 'Microsoft Edge', feature: 'app', names: ['edge', 'microsoft edge'], operatingSystems: [OperatingSystem.Android], platforms: [DevicePlatform.Mobile, DevicePlatform.Tablet, DevicePlatform.TV], version: 46 },
        { displayName: 'Opera Browser', feature: 'app', names: ['opera'], operatingSystems: [OperatingSystem.ChromeOS, OperatingSystem.Linux, OperatingSystem.MacOS, OperatingSystem.Windows], platforms: [DevicePlatform.Desktop], version: 43  },
        // Permissions API
        { displayName: 'Google Chrome', feature: 'permissions', names: ['chrome'], operatingSystems: [OperatingSystem.ChromeOS, OperatingSystem.Linux, OperatingSystem.MacOS, OperatingSystem.Windows], platforms: [DevicePlatform.Desktop], version: 43 },
        { displayName: 'Google Chrome', feature: 'permissions', names: ['chrome'], operatingSystems: [OperatingSystem.Android], platforms: [DevicePlatform.Mobile, DevicePlatform.Tablet, DevicePlatform.TV], version: 89 },
        { displayName: 'Microsoft Edge', feature: 'permissions', names: ['edge', 'microsoft edge'], operatingSystems: [OperatingSystem.Linux, OperatingSystem.MacOS, OperatingSystem.Windows], platforms: [DevicePlatform.Any], version: 79 },
        { displayName: 'Microsoft Edge', feature: 'permissions', names: ['edge', 'microsoft edge'], operatingSystems: [OperatingSystem.Android], platforms: [DevicePlatform.Mobile, DevicePlatform.Tablet, DevicePlatform.TV], version: 46 },
        { displayName: 'Mozilla Firefox', feature: 'permissions', names: ['firefox', 'mozilla firefox'], operatingSystems: [OperatingSystem.ChromeOS, OperatingSystem.Linux, OperatingSystem.MacOS, OperatingSystem.Windows], platforms: [DevicePlatform.Desktop], version: 46 },
        { displayName: 'Mozilla Firefox', feature: 'permissions', names: ['firefox', 'mozilla firefox'], operatingSystems: [OperatingSystem.Android], platforms: [DevicePlatform.Mobile, DevicePlatform.Tablet, DevicePlatform.TV], version: 86 },
        { displayName: 'Opera Browser', feature: 'permissions', names: ['opera'], operatingSystems: [OperatingSystem.ChromeOS, OperatingSystem.Linux, OperatingSystem.MacOS, OperatingSystem.Windows], platforms: [DevicePlatform.Desktop], version: 30  }
    ];
}