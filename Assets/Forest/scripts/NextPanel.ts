import {Interactable} from "SpectaclesInteractionKit/Components/Interaction/Interactable/Interactable"
import {validate} from "SpectaclesInteractionKit/Utils/validate"

@component
export class NextPanel extends BaseScriptComponent {
  @input
  @hint("The panel that is visible before advancing")
  currentPanel!: SceneObject

  @input
  @hint("The panel to show when the button is pressed")
  nextPanel!: SceneObject

  @input
  @allowUndefined
  @hint("Optional. Uses an Interactable on this object if not set.")
  triggerButton: Interactable | undefined

  onAwake(): void {
    this.createEvent("OnStartEvent").bind(() => {
      validate(this.currentPanel, "Assign currentPanel in the Inspector.")
      validate(this.nextPanel, "Assign nextPanel in the Inspector.")

      const interactable =
        this.triggerButton ??
        this.getSceneObject().getComponent(Interactable.getTypeName())

      if (interactable) {
        interactable.onTriggerEnd.add(this.goNext)
      } else {
        this.createEvent("TapEvent").bind(this.goNext)
        print(
          "NextPanel: No Interactable found — using TapEvent. Add an Interactable component for Spectacles pinch.",
        )
      }
    })
  }

  private goNext = (): void => {
    this.currentPanel.enabled = false
    this.nextPanel.enabled = true
  }
}
