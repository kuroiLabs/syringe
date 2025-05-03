export abstract class Destructible {

	protected readonly teardownListeners: Set<(d: this) => any> = new Set();

	/** Runs all destroy listeners */
	public destroy(): void {
		this.teardownListeners.forEach((listener: (d: this) => any) => {
			listener(this);
		});
		this.teardownListeners.clear();
	}

	/**
	 * Registers a listener to run on `destroy`
	 * @return Teardown function to cancel the listener
	 */
	public listenForDestroy(listener: (d: this) => any): () => void {
		this.teardownListeners.add(listener);

		return (): void => {
			this.teardownListeners.delete(listener);
		};
	}

}