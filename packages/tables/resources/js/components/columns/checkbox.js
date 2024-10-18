export default function checkboxTableColumn({
    name,
    recordKey,
    state,
}) {
    return {
        error: undefined,

        isLoading: false,

        state,

        init: function () {
            Livewire.hook('commit', ({ component, commit, succeed, fail, respond }) => {
                succeed(({ snapshot, effect }) => {
                    this.$nextTick(() => {
                        if (this.isLoading) {
                            return
                        }

                        if (component.id !== this.$root.closest('[wire\\:id]').attributes['wire:id'].value) {
                            return
                        }

                        const serverState = this.getServerState()

                        if (
                            (serverState === undefined) ||
                            (Alpine.raw(this.state) === serverState)
                        ) {
                            return
                        }

                        this.state = serverState
                    })
                })
            })

            this.$watch('state', async () => {
                const serverState = this.getServerState()

                if (
                    (serverState === undefined) ||
                    (Alpine.raw(this.state) === serverState)
                ) {
                    return
                }

                this.isLoading = true

                const response = await this.$wire.updateTableColumnState(
                    name,
                    recordKey,
                    this.state,
                )

                this.error = response?.error ?? undefined

                if (
                    (! this.error) &&
                    this.$refs.serverState
                ) {
                    this.$refs.serverState.value = this.state ? '1' : '0'
                }

                this.isLoading = false
            })
        },

        getServerState: function () {
            if (! this.$refs.serverState) {
                return undefined
            }

            return this.$refs.serverState.value === '1' ? true : false
        },
    }
}