# Living Forest — PRD + Lens Studio Build Guide
**Platform:** Snap Spectacles / Lens Studio 5.x  
**Offline-first note:** This PRD includes **hardcoded fallbacks** so the demo works on your flight without internet. Swap to OpenAI when online.

---

## 1. Product summary

**Living Forest** is a guided AR learning experience where Pepper (your guide) helps users discover trees, identify connected wildlife, interact with 3D species, and save discoveries as glowing leaves in a personal forest.

### Recommended menu names

| Your draft | Recommended | Why |
|---|---|---|
| Discover | **Observe** | Matches your XR script; feels educational, not passive |
| Tree Talk | **Wonder** | Short, kid-friendly, distinct from Observe |
| Collect | **Observe** (merged) | Collect is a *step inside* Observe, not a top-level mode |
| Grow | **Cultivate** | Matches your script; implies care, not just placement |

**Final top-level menu (3 leaves):**

1. **Observe** — photo tree → learn habitat → photo critter → 3D model → save leaf  
2. **Wonder** — ask a question about trees (voice/text)  
3. **Cultivate** — place a tree in your growing forest  

> If you want 4 icons for the hackathon UI you already designed, use: **Observe · Wonder · Cultivate · My Forest** (My Forest = saved leaves gallery).

---

## 2. User story → acceptance criteria

| Step | User does | System does | Done when |
|---|---|---|---|
| 1 | Opens lens | Title card + tagline audio | Title visible 3s, then fades |
| 2 | — | Pepper intro | Pepper visible + voice line plays |
| 3 | Looks at left hand | Hand menu appears as leaves | 3 category leaves parented to left wrist |
| 4 | Pinches **Observe** | Pepper explains mode, fades | Observe UI active |
| 5 | Pinches camera/capture | Tree photo captured | Birch or Oak identified (mock offline) |
| 6 | Reads prompt, photos critter | Species matched | Owl / Robin / Ladybug / Squirrel |
| 7 | — | 3D critter spawns in front of user | User can rotate it |
| 8 | Pinches glowing leaf | Discovery saved | Leaf added to forest record |
| 9 | Returns to menu | Pepper reappears per category | Menu restored on left hand |

---

## 3. Lens Studio scene hierarchy

Create this structure in **Scene Hierarchy** (top → bottom = script init order matters for SIK):

```
LivingForest (empty root)
├── SIK (SpectaclesInteractionKit prefab — already in project)
├── Camera Object
│   ├── Camera (Device Tracking: World)
│   └── Device Tracking Component
├── Audio
│   ├── TitleSting
│   ├── PepperLines (one AudioTrack per line, or one clip with markers)
│   └── AmbientForest
├── UI_Root (Screen or World space)
│   ├── TitleCard (Image: intro-menu.png, disabled after start)
│   ├── ResponseText (Text — for answers / loading)
│   └── GlowingLeafButton (Image + Interactable + PinchButton)
├── Pepper
│   └── pepper3d (GLB — Assets/Forest/3dmodels/pepper3d (1).glb)
├── HandMenu
│   ├── MenuAnchor (empty — positioned by script)
│   ├── Leaf_Observe (Image ui_03 + Interactable)
│   ├── Leaf_Wonder (Image ui_05 + Interactable)
│   └── Leaf_Cultivate (Image ui_08 + Interactable)
├── FlowPanels
│   ├── Panel_Observe (capture UI, prompts)
│   ├── Panel_Wonder (text prompt UI)
│   └── Panel_Cultivate (place tree UI)
├── Capture
│   └── CaptureButton (PinchButton prefab from SIK)
├── CritterSpawnRoot (empty — spawn point)
├── ForestGallery (empty — saved leaves parent here)
├── TreePrefab (disabled template — Tree_XR_1 mesh/material)
└── CritterPrefabs (all disabled)
    ├── Owl
    ├── Robin
    ├── Ladybug
    └── Squirrel
└── Scripts (empty object, scripts below in this order)
    ├── LivingForestController
    ├── PepperGuide
    ├── HandMenuController
    ├── ObserveFlowController
    ├── WonderFlowController
    ├── CultivateFlowController
    └── ForestSaveController
```

### Per-object components checklist

| Object | Components |
|---|---|
| Each menu leaf | `Interactable`, `PinchButton`, `ButtonFeedback` (optional) |
| Capture button | `Interactable`, `PinchButton` |
| Glowing leaf save | `Interactable`, `PinchButton` |
| Each critter prefab | `Interactable`, `InteractableManipulation` (rotation only) |
| Pepper | `Render Mesh Visual` or imported GLB |
| Camera | `Device Tracking` → **World** |

---

## 4. Offline vs online strategy (for your flight)

| Feature | Offline (flight) | Online (hackathon demo) |
|---|---|---|
| Tree ID | User picks Birch/Oak buttons OR mock always returns Birch | OpenAI vision on photo |
| Critter ID | User picks from 4 icons after tree step | OpenAI vision on photo |
| Wonder answers | `FOREST_KNOWLEDGE` static text | `OpenAIConnector` |
| Pepper voice | Pre-imported `.wav` files | Same |
| Save leaf | Local `ForestSaveController` array | + optional cloud later |

---

## 5. Voice + copy script (full)

### App open — Title card
**On screen:** `Living Forest`  
**Tagline:** *"Every tree holds a world."*  
**Audio:** soft forest sting (2–3s)

---

### Pepper — first appearance
> Hi! I'm Pepper. I'm here to help you explore the living world around trees.  
> When you're ready, look at your **left hand** — your forest menu will appear there.  
> Choose where you'd like to begin.

---

### Hand menu — category intros (Pepper appears, speaks, fades)

**Observe**  
> Welcome to **Observe**.  
> Trees are not alone — they're part of living ecosystems.  
> We'll find a tree, then discover who depends on it.  
> When you're ready, take a picture of a tree and I'll help you explore its connections.

**Wonder**  
> Welcome to **Wonder**.  
> Curious about trees? Ask me anything — roots, leaves, animals, seasons, anything.  
> I'll do my best to help you understand.

**Cultivate**  
> Welcome to **Cultivate**.  
> Your forest is a living record of everything you discover.  
> Here you can place a tree and watch your forest grow with every observation.

---

### Observe flow

**After tree capture (Birch)**  
> You found a **Birch**!  
> Its papery bark and drooping branches create shelter for birds and insects.  
> This tree is a habitat — life lives in its branches, bark, roots, and soil.  
> Now look closely around this tree.  
> What bird or forest friend might depend on it?  
> When you see one, take a picture — or choose one to explore.

**After tree capture (Oak)**  
> You found an **Oak**!  
> Oaks are forest anchors — their acorns feed squirrels, their branches shelter owls, and their bark hosts entire tiny worlds.  
> Look around this tree. Who might share this space with it?

**Wildlife prompt (on screen)**  
> What kind of bird or critter can you find that this tree supports?  
> Take a photo when you spot one — or tap a species to explore.

**After critter selected — Owl**  
> You discovered an **Owl**!  
> Owls nest in tree cavities and old branches. The tree gives shelter; the owl keeps the forest in balance.  
> Take a closer look — you can spin it to study it from every angle.

**After critter selected — Robin**  
> A **Robin**! Robins often build nests in birch and oak branches. This tree is their home address.

**After critter selected — Ladybug**  
> A **Ladybug**! Tiny but important — ladybugs help trees by eating pests on leaves and bark.

**After critter selected — Squirrel**  
> A **Squirrel**! Oaks and squirrels are partners — acorns feed squirrels, and squirrels help plant new trees.

**Insight moment**  
> This is not an isolated animal.  
> It depends on the tree — and the tree depends on soil, air, water, and other species you can't always see.  
> What other lives do you think share this space?

**Save moment**  
> You've made a meaningful discovery!  
> Tap the **glowing leaf** to add this connection to your forest.  
> Or return to the menu to explore more.

---

### Wonder flow (example offline answers baked in)
**Prompt on screen:** *"What would you like to know about trees?"*

---

### Cultivate flow
> Your forest grows through care, not extraction.  
> Point where you'd like to plant your tree, then pinch to place it.  
> Each leaf you saved tells part of your forest's story.

---

## 6. Static data file

Create `Assets/Forest/scripts/forestData.ts`:

```typescript
export type TreeSpecies = "birch" | "oak"
export type CritterSpecies = "owl" | "robin" | "ladybug" | "squirrel"

export type ForestDiscovery = {
  id: string
  tree: TreeSpecies
  critter: CritterSpecies
  savedAtMs: number
}

export const TREE_COPY: Record<TreeSpecies, string> = {
  birch:
    "Birch trees have papery bark and drooping branches that shelter birds and insects.",
  oak:
    "Oak trees are forest anchors. Their acorns feed wildlife and their branches host many species.",
}

export const CRITTER_COPY: Record<CritterSpecies, string> = {
  owl: "Owls nest in tree cavities. The tree gives shelter; the owl helps balance the forest.",
  robin: "Robins build nests in tree branches. This tree is their home.",
  ladybug: "Ladybugs eat pests on leaves and bark, helping keep trees healthy.",
  squirrel: "Squirrels eat acorns and help plant new trees across the forest.",
}

export const WONDER_ANSWERS: Record<string, string> = {
  roots: "Tree roots anchor the tree and share nutrients with fungi and soil life.",
  leaves: "Leaves capture sunlight and release oxygen — food and air for the forest.",
  animals: "Trees support birds, insects, and mammals with food, shelter, and nesting sites.",
  soil: "Healthy soil full of fungi and microbes helps trees absorb water and nutrients.",
  default:
    "Trees connect sky and soil. Every part of a tree supports life you can see — and life you cannot.",
}

export const PEPPER_LINES = {
  intro:
    "Hi! I'm Pepper. Look at your left hand to open your forest menu.",
  observeIntro:
    "Welcome to Observe. Find a tree and we'll discover the life connected to it.",
  wonderIntro:
    "Welcome to Wonder. Ask me anything about trees.",
  cultivateIntro:
    "Welcome to Cultivate. Add your discoveries to your growing forest.",
  treeCapturedBirch: "You found a Birch! Let's explore who depends on it.",
  treeCapturedOak: "You found an Oak! Let's explore who depends on it.",
  critterPrompt:
    "What bird or critter might this tree support? Take a photo or choose one.",
  savePrompt:
    "Tap the glowing leaf to save this discovery to your forest.",
} as const
```

---

## 7. Full scripts

### 7.1 `LivingForestController.ts` — main state machine

```typescript
import {validate} from "SpectaclesInteractionKit/Utils/validate"

export enum ForestMode {
  Title = "title",
  Intro = "intro",
  Menu = "menu",
  Observe = "observe",
  Wonder = "wonder",
  Cultivate = "cultivate",
}

@component
export class LivingForestController extends BaseScriptComponent {
  @input titleCard!: SceneObject
  @input pepperGuide!: ScriptComponent
  @input handMenu!: ScriptComponent
  @input observeFlow!: ScriptComponent
  @input wonderFlow!: ScriptComponent
  @input cultivateFlow!: ScriptComponent
  @input titleAudio!: AudioComponent
  @input taglineAudio!: AudioComponent

  private mode: ForestMode = ForestMode.Title

  onAwake(): void {
    this.createEvent("OnStartEvent").bind(() => this.startExperience())
  }

  private startExperience(): void {
    this.setMode(ForestMode.Title)
    this.titleAudio?.play(1)

    const delay = this.createEvent("DelayedCallbackEvent") as DelayedCallbackEvent
    delay.bind(() => {
      this.titleCard.enabled = false
      this.taglineAudio?.play(1)
      this.setMode(ForestMode.Intro)
    })
    delay.reset(2.5)
  }

  public setMode(mode: ForestMode): void {
    this.mode = mode
    this.applyMode()
  }

  public getMode(): ForestMode {
    return this.mode
  }

  private applyMode(): void {
    validate(this.pepperGuide)
    validate(this.handMenu)
    validate(this.observeFlow)
    validate(this.wonderFlow)
    validate(this.cultivateFlow)

    const pepper = this.pepperGuide as any
    const menu = this.handMenu as any
    const observe = this.observeFlow as any
    const wonder = this.wonderFlow as any
    const cultivate = this.cultivateFlow as any

    observe.setActive(false)
    wonder.setActive(false)
    cultivate.setActive(false)
    menu.setVisible(false)

    switch (this.mode) {
      case ForestMode.Title:
        this.titleCard.enabled = true
        pepper.hide()
        break

      case ForestMode.Intro:
        pepper.showAndSpeak("intro", () => {
          this.setMode(ForestMode.Menu)
        })
        break

      case ForestMode.Menu:
        menu.setVisible(true)
        pepper.hide()
        break

      case ForestMode.Observe:
        menu.setVisible(false)
        pepper.showAndSpeak("observeIntro", () => {
          pepper.hide()
          observe.setActive(true)
        })
        break

      case ForestMode.Wonder:
        menu.setVisible(false)
        pepper.showAndSpeak("wonderIntro", () => {
          pepper.hide()
          wonder.setActive(true)
        })
        break

      case ForestMode.Cultivate:
        menu.setVisible(false)
        pepper.showAndSpeak("cultivateIntro", () => {
          pepper.hide()
          cultivate.setActive(true)
        })
        break
    }
  }

  public returnToMenu(): void {
    this.setMode(ForestMode.Menu)
  }
}
```

---

### 7.2 `PepperGuide.ts`

```typescript
import {PEPPER_LINES} from "./forestData"

type LineKey = keyof typeof PEPPER_LINES

@component
export class PepperGuide extends BaseScriptComponent {
  @input pepperObject!: SceneObject
  @input responseText!: Text
  @input lineAudioTracks: AudioTrackAsset[] = []
  @input useTextFallback: boolean = true

  private audio: AudioComponent | null = null
  private visible: boolean = false

  onAwake(): void {
    this.audio = this.pepperObject.createComponent("Component.AudioComponent")
    this.hide()
  }

  public show(): void {
    this.pepperObject.enabled = true
    this.visible = true
  }

  public hide(): void {
    this.pepperObject.enabled = false
    this.visible = false
  }

  public showAndSpeak(lineKey: LineKey, onComplete?: () => void): void {
    const line = PEPPER_LINES[lineKey]
    this.show()

    if (this.useTextFallback && this.responseText) {
      this.responseText.text = line
    }

    // Offline: map line keys to audio track indices in Inspector
    const trackIndex = this.getTrackIndex(lineKey)
    if (this.audio && trackIndex >= 0 && trackIndex < this.lineAudioTracks.length) {
      const track = this.lineAudioTracks[trackIndex]
      this.audio.audioTrack = track
      this.audio.play(1)
    }

    const done = this.createEvent("DelayedCallbackEvent") as DelayedCallbackEvent
    done.bind(() => {
      if (onComplete) onComplete()
    })
    done.reset(4.0)
  }

  private getTrackIndex(lineKey: LineKey): number {
    const order: LineKey[] = [
      "intro",
      "observeIntro",
      "wonderIntro",
      "cultivateIntro",
      "treeCapturedBirch",
      "treeCapturedOak",
      "critterPrompt",
      "savePrompt",
    ]
    return order.indexOf(lineKey)
  }
}
```

---

### 7.3 `HandMenuController.ts` — menu on left hand

```typescript
import {Interactable} from "SpectaclesInteractionKit/Components/Interaction/Interactable/Interactable"
import {HandInputData} from "SpectaclesInteractionKit/Providers/HandInputData/HandInputData"
import {LivingForestController, ForestMode} from "./LivingForestController"

@component
export class HandMenuController extends BaseScriptComponent {
  @input menuRoot!: SceneObject
  @input observeLeaf!: SceneObject
  @input wonderLeaf!: SceneObject
  @input cultivateLeaf!: SceneObject
  @input appController!: LivingForestController

  @input handOffset: vec3 = new vec3(0.12, 0.08, 0.05)
  @input menuScale: number = 0.8

  private handData = HandInputData.getInstance()

  onAwake(): void {
    this.setVisible(false)
    this.bindLeaf(this.observeLeaf, () =>
      this.appController.setMode(ForestMode.Observe),
    )
    this.bindLeaf(this.wonderLeaf, () =>
      this.appController.setMode(ForestMode.Wonder),
    )
    this.bindLeaf(this.cultivateLeaf, () =>
      this.appController.setMode(ForestMode.Cultivate),
    )
    this.createEvent("UpdateEvent").bind(() => this.followLeftHand())
  }

  public setVisible(visible: boolean): void {
    this.menuRoot.enabled = visible
  }

  private bindLeaf(leaf: SceneObject, onPick: () => void): void {
    const interactable = leaf.getComponent(
      Interactable.getTypeName(),
    ) as Interactable
    interactable.onTriggerEnd.add(onPick)
  }

  private followLeftHand(): void {
    if (!this.menuRoot.enabled) return

    const leftHand = this.handData.getHand("left")
    if (!leftHand.isTracked()) return

    const wrist = leftHand.getWrist()
    const wristPos = wrist.position
    const wristRot = wrist.rotation

    const offsetWorld = wristRot.multiplyVec3(this.handOffset)
    const targetPos = wristPos.add(offsetWorld)

    const t = this.menuRoot.getTransform()
    t.setWorldPosition(targetPos)
    t.setWorldRotation(wristRot)
    t.setWorldScale(new vec3(this.menuScale, this.menuScale, this.menuScale))
  }
}
```

> **Inspector note:** If `getWrist()` isn't available on your SIK version, use `leftHand.indexTip` or attach menu to a hand-tracking attachment point. Check Output panel for compile errors and swap to `getKeypoint("wrist")` if needed.

---

### 7.4 `ObserveFlowController.ts` — tree → critter → save

```typescript
import {Interactable} from "SpectaclesInteractionKit/Components/Interaction/Interactable/Interactable"
import {LivingForestController} from "./LivingForestController"
import {PepperGuide} from "./PepperGuide"
import {CritterSpecies, TreeSpecies, TREE_COPY, CRITTER_COPY} from "./forestData"

enum ObserveStep {
  TreeCapture,
  TreeResult,
  CritterCapture,
  CritterResult,
  Save,
}

@component
export class ObserveFlowController extends BaseScriptComponent {
  @input panelRoot!: SceneObject
  @input captureButton!: Interactable
  @input saveLeafButton!: Interactable
  @input backButton!: Interactable

  @input birchButton!: Interactable
  @input oakButton!: Interactable
  @input owlButton!: Interactable
  @input robinButton!: Interactable
  @input ladybugButton!: Interactable
  @input squirrelButton!: Interactable

  @input responseText!: Text
  @input pepper!: PepperGuide
  @input appController!: LivingForestController
  @input critterSpawner!: ScriptComponent
  @input forestSave!: ScriptComponent
  @input openAIConnector: ScriptComponent | undefined

  @input useOfflineMocks: boolean = true

  private step: ObserveStep = ObserveStep.TreeCapture
  private currentTree: TreeSpecies | null = null
  private currentCritter: CritterSpecies | null = null

  onAwake(): void {
    this.captureButton.onTriggerEnd.add(() => this.onCapturePressed())
    this.saveLeafButton.onTriggerEnd.add(() => this.onSavePressed())
    this.backButton.onTriggerEnd.add(() => this.appController.returnToMenu())

    this.birchButton.onTriggerEnd.add(() => this.onTreeSelected("birch"))
    this.oakButton.onTriggerEnd.add(() => this.onTreeSelected("oak"))

    this.owlButton.onTriggerEnd.add(() => this.onCritterSelected("owl"))
    this.robinButton.onTriggerEnd.add(() => this.onCritterSelected("robin"))
    this.ladybugButton.onTriggerEnd.add(() => this.onCritterSelected("ladybug"))
    this.squirrelButton.onTriggerEnd.add(() => this.onCritterSelected("squirrel"))
  }

  public setActive(active: boolean): void {
    this.panelRoot.enabled = active
    if (active) {
      this.step = ObserveStep.TreeCapture
      this.currentTree = null
      this.currentCritter = null
      this.responseText.text =
        "Point at a tree and pinch to capture — or choose Birch or Oak."
      this.pepper.showAndSpeak("observeIntro")
    } else {
      const spawner = this.critterSpawner as any
      spawner.clear()
    }
  }

  private onCapturePressed(): void {
    if (this.step === ObserveStep.TreeCapture) {
      if (this.useOfflineMocks) {
        this.responseText.text =
          "Tree captured! Choose Birch or Oak to continue."
      } else {
        this.responseText.text = "Analyzing tree..."
        // Wire to OpenAIConnector.createCameraRequest when online
      }
      return
    }

    if (this.step === ObserveStep.CritterCapture) {
      if (this.useOfflineMocks) {
        this.responseText.text =
          "Critter captured! Choose owl, robin, ladybug, or squirrel."
      } else {
        this.responseText.text = "Analyzing wildlife..."
      }
    }
  }

  private onTreeSelected(tree: TreeSpecies): void {
    this.currentTree = tree
    this.step = ObserveStep.TreeResult
    this.responseText.text = TREE_COPY[tree]
    this.pepper.showAndSpeak(
      tree === "birch" ? "treeCapturedBirch" : "treeCapturedOak",
      () => {
        this.pepper.hide()
        this.step = ObserveStep.CritterCapture
        this.pepper.showAndSpeak("critterPrompt", () => this.pepper.hide())
        this.responseText.text =
          "What bird or critter does this tree support? Capture or choose one."
      },
    )
  }

  private onCritterSelected(critter: CritterSpecies): void {
    if (!this.currentTree) return

    this.currentCritter = critter
    this.step = ObserveStep.CritterResult
    this.responseText.text = CRITTER_COPY[critter]

    const spawner = this.critterSpawner as any
    spawner.spawn(critter)

    this.step = ObserveStep.Save
    this.pepper.showAndSpeak("savePrompt", () => this.pepper.hide())
  }

  private onSavePressed(): void {
    if (!this.currentTree || !this.currentCritter) return

    const save = this.forestSave as any
    save.saveDiscovery(this.currentTree, this.currentCritter)

    this.responseText.text = "Saved to your forest!"
    const delay = this.createEvent("DelayedCallbackEvent") as DelayedCallbackEvent
    delay.bind(() => this.appController.returnToMenu())
    delay.reset(1.5)
  }
}
```

---

### 7.5 `CritterSpawner.ts` — 3D critter in front of user (easiest: spin in place)

```typescript
import {InteractableManipulation} from "SpectaclesInteractionKit/Components/Interaction/InteractableManipulation/InteractableManipulation"
import {CritterSpecies} from "./forestData"

@component
export class CritterSpawner extends BaseScriptComponent {
  @input spawnRoot!: SceneObject
  @input cameraObject!: SceneObject
  @input owlPrefab!: ObjectPrefab
  @input robinPrefab!: ObjectPrefab
  @input ladybugPrefab!: ObjectPrefab
  @input squirrelPrefab!: ObjectPrefab
  @input spawnDistance: number = 80
  @input spawnYOffset: number = -10

  private activeCritter: SceneObject | null = null

  public spawn(species: CritterSpecies): void {
    this.clear()

    const prefab = this.getPrefab(species)
    const obj = prefab.instantiate(this.spawnRoot)
    obj.enabled = true

    const camT = this.cameraObject.getTransform()
    const forward = camT.forward
    const pos = camT
      .getWorldPosition()
      .add(forward.uniformScale(-this.spawnDistance))
      .add(new vec3(0, this.spawnYOffset, 0))

    const t = obj.getTransform()
    t.setWorldPosition(pos)
    t.setWorldRotation(quat.lookAt(forward, vec3.up()))
    t.setWorldScale(new vec3(1, 1, 1))

    this.configureManipulation(obj)
    this.activeCritter = obj
  }

  public clear(): void {
    if (this.activeCritter) {
      this.activeCritter.destroy()
      this.activeCritter = null
    }
  }

  private getPrefab(species: CritterSpecies): ObjectPrefab {
    switch (species) {
      case "owl":
        return this.owlPrefab
      case "robin":
        return this.robinPrefab
      case "ladybug":
        return this.ladybugPrefab
      case "squirrel":
        return this.squirrelPrefab
    }
  }

  private configureManipulation(obj: SceneObject): void {
    const manipulation = obj.getComponent(
      InteractableManipulation.getTypeName(),
    ) as InteractableManipulation

    if (!manipulation) return

    // Easiest interaction: spin in place only
    manipulation.enableXTranslation = false
    manipulation.enableYTranslation = false
    manipulation.enableZTranslation = false
    manipulation.enableRotation = true
    manipulation.enableScale = false
  }
}
```

> **Easiest path:** rotation-only in front of camera.  
> **Walk-around path (later):** spawn with World Query hit test + world-locked transform.  
> **Hold-and-move path:** enable translation on `InteractableManipulation`.

---

### 7.6 `ForestSaveController.ts` — glowing leaf / discovery record

```typescript
import {CritterSpecies, ForestDiscovery, TreeSpecies} from "./forestData"

@component
export class ForestSaveController extends BaseScriptComponent {
  @input galleryRoot!: SceneObject
  @input leafPrefab!: ObjectPrefab
  @input leafSpacing: number = 12

  private discoveries: ForestDiscovery[] = []

  public saveDiscovery(tree: TreeSpecies, critter: CritterSpecies): void {
    const discovery: ForestDiscovery = {
      id: `${tree}-${critter}-${getTime()}`,
      tree,
      critter,
      savedAtMs: getTime(),
    }
    this.discoveries.push(discovery)
    this.spawnLeaf(discovery)
  }

  private spawnLeaf(discovery: ForestDiscovery): void {
    const leaf = this.leafPrefab.instantiate(this.galleryRoot)
    leaf.enabled = true

    const index = this.discoveries.length - 1
    const x = (index % 5) * this.leafSpacing
    const y = Math.floor(index / 5) * this.leafSpacing

    const t = leaf.getTransform()
    t.setLocalPosition(new vec3(x, y, 0))
  }

  public getDiscoveries(): ForestDiscovery[] {
    return this.discoveries
  }
}
```

---

### 7.7 `WonderFlowController.ts` — offline Q&A

```typescript
import {Interactable} from "SpectaclesInteractionKit/Components/Interaction/Interactable/Interactable"
import {WONDER_ANSWERS} from "./forestData"
import {LivingForestController} from "./LivingForestController"

@component
export class WonderFlowController extends BaseScriptComponent {
  @input panelRoot!: SceneObject
  @input backButton!: Interactable
  @input rootsButton!: Interactable
  @input leavesButton!: Interactable
  @input animalsButton!: Interactable
  @input soilButton!: Interactable
  @input responseText!: Text
  @input appController!: LivingForestController

  onAwake(): void {
    this.backButton.onTriggerEnd.add(() => this.appController.returnToMenu())
    this.rootsButton.onTriggerEnd.add(() => this.answer("roots"))
    this.leavesButton.onTriggerEnd.add(() => this.answer("leaves"))
    this.animalsButton.onTriggerEnd.add(() => this.answer("animals"))
    this.soilButton.onTriggerEnd.add(() => this.answer("soil"))
  }

  public setActive(active: boolean): void {
    this.panelRoot.enabled = active
    if (active) {
      this.responseText.text = "What would you like to know about trees?"
    }
  }

  private answer(key: keyof typeof WONDER_ANSWERS): void {
    this.responseText.text = WONDER_ANSWERS[key]
  }
}
```

---

### 7.8 `CultivateFlowController.ts` — place tree (session-only, simple)

```typescript
import {Interactable} from "SpectaclesInteractionKit/Components/Interaction/Interactable/Interactable"
import {LivingForestController} from "./LivingForestController"

@component
export class CultivateFlowController extends BaseScriptComponent {
  @input panelRoot!: SceneObject
  @input placeButton!: Interactable
  @input backButton!: Interactable
  @input treePrefab!: ObjectPrefab
  @input cameraObject!: SceneObject
  @input forestRoot!: SceneObject
  @input responseText!: Text
  @input appController!: LivingForestController
  @input placeDistance: number = 120

  onAwake(): void {
    this.placeButton.onTriggerEnd.add(() => this.placeTree())
    this.backButton.onTriggerEnd.add(() => this.appController.returnToMenu())
  }

  public setActive(active: boolean): void {
    this.panelRoot.enabled = active
    if (active) {
      this.responseText.text =
        "Look where you want your tree, then pinch to plant it."
    }
  }

  private placeTree(): void {
    const camT = this.cameraObject.getTransform()
    const forward = camT.forward
    const pos = camT
      .getWorldPosition()
      .add(forward.uniformScale(-this.placeDistance))

    const tree = this.treePrefab.instantiate(this.forestRoot)
    tree.enabled = true
    const t = tree.getTransform()
    t.setWorldPosition(pos)
    t.setWorldRotation(quat.quatIdentity())

    this.responseText.text = "Tree planted! Your forest is growing."
  }
}
```

> **Upgrade later:** replace fixed-distance placement with `WorldQueryModule` hit test + Spatial Anchors for persistence.

---

## 8. Lens Studio step-by-step (do this on the plane)

### Phase A — 30 min: Scene skeleton
1. Open project in Lens Studio.
2. Import `pepper3d (1).glb` if not already in scene.
3. Create hierarchy from Section 3.
4. Set Camera → Device Tracking → **World**.
5. Confirm SIK prefab is present and runs in Interactive Preview.

### Phase B — 45 min: Scripts
1. Create all `.ts` files under `Assets/Forest/scripts/`.
2. Add scripts to `Scripts` object in order listed.
3. Wire all `@input` fields in Inspector (drag SceneObjects).
4. Set `useOfflineMocks = true` on `ObserveFlowController`.
5. Build — fix any `getWrist()` / type errors from Output panel.

### Phase C — 45 min: UI + audio
1. Assign leaf textures (`ui_03`, `ui_05`, `ui_08`) to menu leaves.
2. Assign `intro-menu.png` to TitleCard.
3. Record Pepper lines as short `.wav` files on your phone before the flight; import to `Assets/Forest/audio/`.
4. Drag audio tracks into `PepperGuide.lineAudioTracks` in order from `getTrackIndex()`.

### Phase D — 30 min: Critter + tree prefabs
1. Import or placeholder 4 critter GLBs (cubes with labels work for hackathon).
2. Add `Interactable` + `InteractableManipulation` to each critter prefab.
3. Use `Tree_XR_1.png` / mesh for tree prefab.
4. Test Observe flow end-to-end in simulator.

### Phase E — 15 min: Polish
1. Glowing leaf: emissive material or pulsing scale animation.
2. Pepper fade: enable/disable on speak complete (already in scripts).
3. Test left-hand menu tracking on device.

---

## 9. Inspector wiring cheat sheet

| Script | Key inputs |
|---|---|
| `LivingForestController` | titleCard, pepperGuide, handMenu, 3 flow controllers, audio |
| `PepperGuide` | pepperObject, responseText, lineAudioTracks[] |
| `HandMenuController` | menuRoot, 3 leaves, appController |
| `ObserveFlowController` | capture/save/back buttons, 6 species buttons, pepper, spawner, save |
| `CritterSpawner` | 4 critter prefabs, cameraObject, spawnRoot |
| `ForestSaveController` | galleryRoot, leafPrefab |
| `WonderFlowController` | topic buttons, responseText |
| `CultivateFlowController` | treePrefab, cameraObject, forestRoot |

---

## 10. MVP scope for hackathon vs flight

**Flight MVP (no internet):**
- Title → Pepper intro → hand menu
- Observe with Birch/Oak + 4 critter buttons (no real vision)
- Critter spins in place
- Save leaf to local gallery
- Wonder with 4 topic buttons
- Cultivate with fixed-distance tree place

**Hackathon demo (with internet):**
- Swap tree/critter buttons for OpenAI vision on `OpenAIConnector`
- Add real critter GLBs
- Optional Spatial Anchors for persistent forest

---

## 11. OpenAI integration hook (when online)

In `ObserveFlowController`, set `useOfflineMocks = false` and on capture call your existing `OpenAIConnector` with prompts like:

- **Tree:** `"Identify if this is birch or oak. Reply with one word: birch or oak."`
- **Critter:** `"Identify wildlife. Reply with one word: owl, robin, ladybug, or squirrel."`

Map the response string to your enums before calling `onTreeSelected` / `onCritterSelected`.

---

## 12. Save this offline

Copy this entire document into a local file before your flight:

```
LivingForest-PRD.md
```

In Lens Studio, also export your scene periodically. Your `Scene.scene` is gitignored (correctly — it holds API keys), so keep a local backup on your machine.

---

I'm in **Ask mode**, so I can't create these files in your repo directly. Switch to **Agent mode** and say *"implement the Living Forest PRD"* if you want me to add all scripts and wire the scene for you before your flight.