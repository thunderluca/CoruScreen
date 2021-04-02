export class Size {
    public aspectRatio: string;
    public height: number;
    public standardName: string;
    public width: number;

    public toString(): string {
        return this.width + 'x' + this.height + ' (' + this.standardName + ')';
    }

    //https://en.wikipedia.org/wiki/Display_resolution
    //https://en.wikipedia.org/wiki/Graphics_display_resolution
    public static getCommonDisplaySizes(aspectRatio?: string): Size[] {
        let availableSizes: Size[] = [
            //3:2
            { aspectRatio: '3:2', height: 320, standardName: 'HVGA', width: 480 },
            { aspectRatio: '3:2', height: 640, standardName: 'DVGA', width: 960 },
            //4:3
            { aspectRatio: '4:3', height: 480, standardName: 'VGA', width: 640 },
            { aspectRatio: '4:3', height: 600, standardName: 'SVGA', width: 800 },
            { aspectRatio: '4:3', height: 768, standardName: 'XGA', width: 1024 },
            { aspectRatio: '4:3', height: 864, standardName: 'XGA+', width: 1152 },
            { aspectRatio: '4:3', height: 1200, standardName: 'UXGA', width: 1600 },
            { aspectRatio: '4:3', height: 1536, standardName: 'QXGA', width: 2048 },
            { aspectRatio: '4:3', height: 2400, standardName: 'QUXGA', width: 3200 },
            //5:4
            { aspectRatio: '5:4', height: 1024, standardName: 'SXGA', width: 1280 },
            { aspectRatio: '5:4', height: 2048, standardName: 'QSXGA', width: 2560 },
            //16:9
            { aspectRatio: '16:9', height: 360, standardName: 'nHD', width: 640 },
            { aspectRatio: '16:9', height: 480, standardName: 'FWVGA', width: 854 },
            { aspectRatio: '16:9', height: 540, standardName: 'qHD', width: 960 },
            { aspectRatio: '16:9', height: 720, standardName: 'HD', width: 1280 },
            { aspectRatio: '16:9', height: 768, standardName: 'WXGA', width: 1360 },
            { aspectRatio: '16:9', height: 768, standardName: 'WXGA', width: 1366 },
            { aspectRatio: '16:9', height: 900, standardName: 'HD+', width: 1600 },
            { aspectRatio: '16:9', height: 1080, standardName: 'FHD', width: 1920 },
            { aspectRatio: '16:9', height: 1152, standardName: 'QWXGA', width: 2048 },
            { aspectRatio: '16:9', height: 1440, standardName: 'QHD', width: 2560 },
            { aspectRatio: '16:9', height: 1800, standardName: 'QHD+', width: 3200 },
            { aspectRatio: '16:9', height: 2160, standardName: '4K UHD', width: 3840 },
            { aspectRatio: '16:9', height: 2880, standardName: '5K', width: 5120 },
            { aspectRatio: '16:9', height: 4320, standardName: '8K', width: 7680 },
            { aspectRatio: '16:9', height: 8640, standardName: '16K', width: 15360 },
            //16:10
            { aspectRatio: '16:10', height: 800, standardName: 'WXGA', width: 1280 },
            { aspectRatio: '16:10', height: 900, standardName: 'WXGA+', width: 1440 },
            { aspectRatio: '16:10', height: 1050, standardName: 'WSXGA+', width: 1680 },
            { aspectRatio: '16:10', height: 1200, standardName: 'WUXGA', width: 1920 },
            { aspectRatio: '16:10', height: 1600, standardName: 'WQXGA', width: 2560 },
            { aspectRatio: '16:10', height: 2400, standardName: 'WQUXGA', width: 3840 },
            //25:16
            { aspectRatio: '25:16', height: 2048, standardName: 'WQSXGA', width: 3200 },
            //256:135
            { aspectRatio: '256:135', height: 1080, standardName: 'DCI 2K', width: 2048 },
            { aspectRatio: '256:135', height: 2160, standardName: 'DCI 4K', width: 4096 }
        ];

        if (aspectRatio) {
            availableSizes = availableSizes.filter(s => s.aspectRatio === aspectRatio);
        }

        return availableSizes;
    }
}