# MediaWiki_Extension_3D_GLB
MediaWiki Extension:3D with GLB support

**To get the extension:3d to work, it is also necessary to include the thumbnail generator:**
https://github.com/OpenDEM/3D2PNG_GLB_Support

**The corresponding MediaWiki configurations must be made from: mediawiki_config_files**

Please refer to the readme.md in this folder for further instructions.

Only simple GLB models and KTX2 compression is supported.

Based on three.js 162 for the following reason pointed out by donmccurdy: Three.js v163 removed support for WebGL 1, but 3d2png depends on headless-gl, which only supports WebGL 1. Assuming 3D and 3D2PNG should use the same three.js versions for consistency, three.js v162 is used for both now.

If you would like to make a contribution, you will find the current status with the open points here: 
https://commons.wikimedia.org/wiki/Commons:Textured_3D

**There is still a lot to do, especially with the thumbnail generator.**
