<template>
    <div class="modal fade" :id="modalName" tabindex="-1" role="dialog" aria-labelledby="modalLabel" aria-hidden="true"
        :class="{ 'modal-cover': cover }">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalLabel">{{ titleText }}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <slot></slot>
                </div>
                <div class="modal-footer">
                    <button @click="onCancel" type="button" class="btn btn-outline-danger ps-3 pe-3"
                        data-bs-dismiss="modal" v-if="!hideCancelButton" id="cancelButton">
                        <i class="fas fa-times"></i> {{ cancelText || 'Cancel' }}
                    </button>
                    <button @click="onConfirm" type="button" class="btn btn-success ps-3 pe-3" data-bs-dismiss="modal" ref="confirmButtonRef"
                        id="confirmButton">
                        <i class="fas fa-check"></i> {{ confirmText || 'Confirm' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
export default {
    props: {
        modalName: String,
        titleText: String,
        cancelText: String,
        confirmText: String,
        hideCancelButton: Boolean,
        cover: Boolean
    },
    data() {
        return {
            wasClosed: false,
            wasClosedByInteraction: false
        }
    },
    mounted() {
        if (this.modalName) {
            document.getElementById(this.modalName)?.addEventListener('hidden.bs.modal', this.onDismiss);
            document.getElementById(this.modalName)?.addEventListener('keydown', this.handleKeyDown);
        }
    },
    beforeUnmount() {
        if (this.modalName) {
            document.getElementById(this.modalName)?.removeEventListener('hidden.bs.modal', this.onDismiss);
            document.getElementById(this.modalName)?.removeEventListener('keydown', this.handleKeyDown);
            document.getElementsByClassName('modal-backdrop').item(0)?.remove(); // Sometimes the backdrop gets stuck on mobile, so we need to remove it manually
        }
    },
    methods: {
        onCancel() {
            this.wasClosed = true;
            this.wasClosedByInteraction = true;
            this.$emit('onCancel');
        },
        onConfirm() {
            this.wasClosed = true;
            this.wasClosedByInteraction = true;
            this.$emit('onConfirm');
        },
        onDismiss() {
            if (!this.wasClosedByInteraction) this.$emit('onDismiss');
            // Reset since modal is not destroyed
            this.wasClosedByInteraction = false;
            this.wasClosed = false;
        },
        handleKeyDown(e: KeyboardEvent) {
            if (this.wasClosed) return;

            const tagName = (e.target as HTMLInputElement).tagName;
            if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'BUTTON' || tagName === 'SELECT') {
                return;
            }

            if (e.altKey || e.shiftKey || e.ctrlKey || e.metaKey) {
                return;
            }

            if (e.key === 'Enter') {
                (this.$refs['confirmButtonRef'] as HTMLButtonElement).click();
            }
        }
    }
}
</script>

<style scoped>
.modal {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1055;
    display: none;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    outline: 0;
}

.modal-content {
    color: rgba(255, 255, 255, 0.75);
    background-color: #1d2835fa;
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    pointer-events: auto;
    background-color: none;
    background-clip: padding-box;
    border: 1px solid rgba(255, 255, 255, .3);
    border-radius: 0;
    outline: 0;
}

.modal-header {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, .3);
    border-top-left-radius: 0;
    border-top-right-radius: 0;
}

.modal-footer {
    display: flex;
    flex-wrap: wrap;
    flex-shrink: 0;
    align-items: center;
    justify-content: flex-end;
    padding: .75rem;
    border-top: 1px solid rgba(255, 255, 255, .3);
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
}

.btn {
    display: inline-block;
    font-weight: 400;
    line-height: 1.5;
    text-align: center;
    text-decoration: none;
    vertical-align: middle;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;

    padding: .375rem .75rem;
    padding-right: 0.75rem;
    padding-left: 0.75rem;
    font-size: .875rem;
    border-radius: 4px;
}

.btn-close {
    box-sizing: content-box;
    width: 1em;
    height: 1em;
    padding: .25em .25em;
    color: #fff;
    background: transparent url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23FFFFFF'%3e%3cpath d='M.293.293a1 1 0 011.414 0L8 6.586 14.293.293a1 1 0 111.414 1.414L9.414 8l6.293 6.293a1 1 0 01-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 01-1.414-1.414L6.586 8 .293 1.707a1 1 0 010-1.414z'/%3e%3c/svg%3e") center/1em auto no-repeat;
    border: 0;
    border-radius: 4px;
    opacity: .5;
}
</style>