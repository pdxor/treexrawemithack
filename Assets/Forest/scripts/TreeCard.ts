import {validate} from "SpectaclesInteractionKit/Utils/validate"

@component
export class TreeCard extends BaseScriptComponent {
  @input
  @hint("Parent panel object — disabled until a card is ready")
  cardPanel!: SceneObject

  @input
  @hint("Image component that displays the generated tree card")
  cardImage!: Image

  @input
  @allowUndefined
  @hint("Optional fallback material with a valid shader pass (e.g. Image 2.mat)")
  sourceMaterial: Material | undefined

  @input
  @allowUndefined
  @hint("Optional placeholder shown while generating")
  placeholderTexture: Texture | undefined

  private materialReady: boolean = false

  onAwake(): void {
    validate(this.cardPanel, "Assign cardPanel in the Inspector.")
    validate(this.cardImage, "Assign cardImage in the Inspector.")
    this.materialReady = this.ensureMaterial()
    this.hide()
  }

  showPlaceholder(): void {
    if (!this.materialReady) {
      this.materialReady = this.ensureMaterial()
    }
    if (!this.materialReady) {
      print("TreeCard: Cannot show placeholder — assign a valid sourceMaterial in Inspector.")
      return
    }
    if (this.placeholderTexture) {
      this.setTexture(this.placeholderTexture)
    }
    this.cardPanel.enabled = true
  }

  showGenerated(texture: Texture): void {
    if (!this.materialReady) {
      this.materialReady = this.ensureMaterial()
    }
    if (!this.materialReady) {
      print("TreeCard: Cannot show generated card — assign a valid sourceMaterial in Inspector.")
      return
    }
    this.setTexture(texture)
    this.cardPanel.enabled = true
  }

  hide(): void {
    this.cardPanel.enabled = false
  }

  private ensureMaterial(): boolean {
    try {
      const baseMaterial = this.sourceMaterial ?? this.cardImage.mainMaterial
      if (!baseMaterial) {
        print("TreeCard: No material assigned to cardImage.")
        return false
      }
      this.cardImage.mainMaterial = baseMaterial.clone()
      return !!this.cardImage.mainMaterial?.mainPass
    } catch (error) {
      print("TreeCard: Failed to prepare material — " + error)
      return false
    }
  }

  private setTexture(texture: Texture): void {
    this.cardImage.mainMaterial.mainPass.baseTex = texture
  }
}
