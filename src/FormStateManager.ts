export type FormState = {
    isSubmitting: boolean
}
export type FormStateType = keyof FormState;
export type UnsubscribeFromState = () => void;
export type StateSubscriber = () => void;

export class FormStateManager {
    #state: FormState = {
        isSubmitting: false,
    }
    #stateToSubscribers: Map<FormStateType, StateSubscriber[]> = new Map();

    subscribe(state: FormStateType, subscriber: StateSubscriber) {
        let subscribers = this.#stateToSubscribers.get(state);
        if (!subscribers) {
            subscribers = [];
            this.#stateToSubscribers.set(state, subscribers);
        }
        subscribers.push(subscriber);
    }

    unsubscribe(state: FormStateType, subscriber: StateSubscriber) {
        let subscribers = this.#stateToSubscribers.get(state);
        if (subscribers) {
            this.#stateToSubscribers.set(state, subscribers.filter(s => s !== subscriber));
        }
    }

    getValue<T extends FormStateType>(state: FormStateType): FormState[T] {
        return this.#state[state];
    }

    setValue<T extends FormStateType>(state: FormStateType, newValue: FormState[T]) {
        const prev = this.#state[state];
        if (prev !== newValue) {
            this.#state[state] = newValue;
            this.#notify(state);
        }
    }

    #notify(state: FormStateType) {
        const subscribers = this.#stateToSubscribers.get(state);
        if (subscribers) {
            subscribers.forEach(notifySubscriber => notifySubscriber());
        }
    }
}