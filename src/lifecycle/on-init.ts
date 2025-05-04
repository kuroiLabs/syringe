/**
 * @author kuro <kuro@kuroi.io>
 * @namespace kuroi.io.Syringe.Lifecycle
 * @description A lifecycle hook called when the Syringe Container
 *   generates the implementing object instance
 */
export interface OnInit {
	/** Called when the Syringe Container generates the implementing instance */
	onInit(): void
}