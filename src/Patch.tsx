/**
 *  The patch categories
 */
export const enum PatchCategory {
    Source = "source",
    Effect = "effect",
    Mixer = "mixer"
};

/**
 *  The video dimensions of the patch
 */
export interface PatchDimensions {
    width: number,
    height: number
};

/**
 *  The credits for the patch
 */
export interface PatchCredits {
    author: string,
    vendor: string,
    email: string,
    url: string
}

/**
 *  The licensing information for the patch
 */
export interface PatchLicense {
    name: string,
    file: string
}

/**
 *  Type containing generic patch information
 */
interface Patch {
    description: string,
    display_name: string,
    category: PatchCategory,
    video: PatchDimensions,
    credits: PatchCredits,
    license: PatchLicense,
    identifier: string
};

export default Patch;
