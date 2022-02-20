/**
 * @author kuro <kuro@kuroi.io>
 * @namespace kuroi.io.Syringe.Lifecycle
 * @description A lifecycle hook called when the Syringe Container
 *   destroys the implementing object instance
 */
export interface OnDestroy {
	/** Called when the Syringe Container destroys the implementing instance */
	onDestroy(): void
}
