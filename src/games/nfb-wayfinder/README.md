## NFB Wayfinder

Game Source Link: https://wayfinder.nfb.ca

Playground Link: https://sunebear.github.io/SB-Playgrounds/games/nfb-wayfinder

### Notes

#### Config
| Key      | Value | Description |
| ----------- | ----------- |----------- |
| haikusPerBiome   | 2 |  |
| embed   | false, true | enable embed mode |
| canvas | DOM - runtime | world render canvas |
| context | Object (webgl2 or webgl) - runtime | world render context |

#### Window
| Key      | Value | Description |
| ----------- | ----------- |----------- |
| world   | Object | the world root object |
| tags   | Object | the all tags map, eg: `world.findTag(Tags.MainCamera)` |
| swapEnv()   | Function | swap current biome |
| drift()   | Function | drift camera in promo mode |
| printStats()   | Function | print renderer info |
| addTestPoem()   | Function | quickly collect a poem |


#### QueryString

| Key      | Value | Description |
| ----------- | ----------- |----------- |
| biome      | forest, grasslands, tundra | set env scene |
| lang   | en, fr | set locale |
| debug | false, true | enable debug mode, show stats |
| promo | false, true | enable promo mode, could save image via `ctrl + s`, save sequence via `ctrl + k`|
| initial | null, journal | set page state |
| resolve | false, true | resolve current biome |
| deterministic | false, true | enable PRNG |
| zoom | false, true | enable zoom, use  `mouse wheel`  |
| view | 2.5d, god, fp | switch different views, or use `number 1-3` |
| ground | true, false | should draw groud |
| groundNormalElement | true, false | should draw groundNormalElement |
| float | true, false | should use float effect |
| post | true, false | should use post effect |
| testwater | false, true | should draw test water |
| testfox | false, true | should draw test fox |
| nolanding | false, true | should hide landing UI |
| nocard | false, true | should hide haiku card |
| nointro | false, true | should hide intro video |
| notutorial | false, true | should hide tutorial overlay |

#### Render Flows

##### By type

- DOMs: UI Contorls, Hints, Journal, TextSpriteOverlay
- 2D Sprites: Animal, Token, Origin Tree & Leaves, Tall Tree, Flower, Grass, Compass
- 3D Models: Envs (Grand, Rock, Water, Weather), Player, Hat Windline, Line3D, Procedural Dot & Leaves

Tips: sprite and model are both three.js meshes, but using different materials that generated by shaderManger. spriteManager is the sprite sheets (texture + meta) manager.

##### By instance

- Render Layers: groundDepth, ground, groundNormalElement, water, grass, atmospherics, shadow
- Grid & Cell: EnvironmentCellSystem + Grid Util -> Entities tag EnvironmentCell & GroundAsset
- Frustum Culling: MainCameraFrustum -> visible when groud assets have GroundAssetInsideFrustum
- Submit Frame: addFrameTasks -> preRenders[] + postRenders[]
- Camera Drift: Hide character & HUD, disable control, enable it when landing page is opened
- Ground Plane: EnvironmentGroundRenderTextureSystem -> SimpleEnvironmentSystem:GroundPlaneLayer -> Quad Mesh (GroundShader)
- Ground Patch: Load GLTF incluing default elements via RefGLTFLoader.js -> loadSceneByName + Sprite (setMeshToSprite) + Model (createMeshMaterial) -> GLTFSpawnItemsMap
- Grass Pool: Setup: Ground Patch Pool + createTilingGrid -> Grass Meshes: InstancedBufferGeometry + Ground Patch Instance Shader (include vert animation) -> Update grid & show meshes in viewport
- Token Constellation: Token Sprite + Line3D + TextSpriteOverlay
- Rain Atmosphere: Emit under water & lake -> Raindrop (CapsuleBufferGeometry) + Rain Ripple (RingGeometry)
- Follow Player Effect: Get UserTarget & EnvironmentUnderPlayerState & GroundDataRenderTarget, trigger particles or animations, such as animal movements, water bubbles, plant collisions
- Lake & Water: Generate Lakes GEO Data (Contours + Bounds) -> WaterMesh:Fill  + Noise Texture:Cells + Distort Texture:Outlines + WaterCollcetionSystem:Bubbles + GroundDataRenderTarget:Ripples
- Haiku Flora: Spawn flowers when character has following paperer -> The sprites use the scale transition for enter/leave, each object has unique scaler, height, flip

### Refs

- [Three.js - JavaScript 3D Library](https://threejs.org)
- [ECSY - An highly experimental Entity Component System for the web](https://ecsy.io)
- [Svelte - Cybernetically enhanced web apps](https://svelte.dev)
- [TexturePacker - Create Sprite Sheets for your game](https://www.codeandweb.com/texturepacker)
- [Some of the early sketches and concept art for WAYFINDER](https://twitter.com/mattdesl/status/1407096478607282184)