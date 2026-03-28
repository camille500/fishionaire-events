<script setup>
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import Link from '@tiptap/extension-link'
import Mention from '@tiptap/extension-mention'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  mode: { type: String, default: 'simple' }, // 'simple' | 'rich' | 'mention'
  maxLength: { type: Number, default: 0 },
  mentionItems: { type: Array, default: () => [] },
  rows: { type: Number, default: 3 },
})

const emit = defineEmits(['update:modelValue', 'update:text'])

const isRich = computed(() => props.mode === 'rich' || props.mode === 'mention')
const hasMentions = computed(() => props.mode === 'mention' && props.mentionItems.length > 0)
const isFocused = ref(false)

// Mention suggestion config
function createMentionSuggestion() {
  return {
    items: ({ query }) => {
      return props.mentionItems
        .filter(item => item.label.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5)
    },
    render: () => {
      let component = null

      return {
        onStart: (p) => {
          component = { props: p }
          mentionProps.value = p
          showMention.value = true
        },
        onUpdate: (p) => {
          if (component) component.props = p
          mentionProps.value = p
        },
        onKeyDown: (p) => {
          if (p.event.key === 'Escape') {
            showMention.value = false
            return true
          }
          return mentionKeyHandler.value?.(p.event) || false
        },
        onExit: () => {
          showMention.value = false
          component = null
        },
      }
    },
    char: '#',
    allowSpaces: false,
  }
}

// Mention state
const showMention = ref(false)
const mentionProps = ref(null)
const mentionKeyHandler = ref(null)

function setMentionKeyHandler(handler) {
  mentionKeyHandler.value = handler
}

function selectMention(item) {
  if (mentionProps.value?.command) {
    mentionProps.value.command({ id: item.id, label: item.label })
  }
  showMention.value = false
}

// Build extensions
function buildExtensions() {
  const exts = [
    StarterKit.configure({
      heading: isRich.value ? { levels: [2, 3] } : false,
      bulletList: isRich.value ? {} : false,
      orderedList: isRich.value ? {} : false,
      blockquote: false,
      codeBlock: false,
      code: false,
      horizontalRule: false,
    }),
    Placeholder.configure({ placeholder: props.placeholder }),
  ]

  if (props.maxLength > 0) {
    exts.push(CharacterCount.configure({ limit: props.maxLength }))
  }

  if (isRich.value) {
    exts.push(Link.configure({ openOnClick: false, HTMLAttributes: { class: 'rich-editor__link' } }))
  }

  if (hasMentions.value) {
    exts.push(Mention.configure({
      HTMLAttributes: { class: 'rich-editor__mention' },
      suggestion: createMentionSuggestion(),
      renderHTML({ node }) {
        return ['span', { class: 'rich-editor__mention', 'data-id': node.attrs.id }, `{{${node.attrs.id}}}`]
      },
    }))
  }

  return exts
}

const editor = useEditor({
  content: props.modelValue || '',
  extensions: buildExtensions(),
  editable: !props.disabled,
  editorProps: {
    attributes: {
      class: 'rich-editor__content',
      style: `min-height: ${props.rows * 1.5}em`,
    },
  },
  onUpdate: ({ editor: e }) => {
    const html = e.getHTML()
    emit('update:modelValue', html === '<p></p>' ? '' : html)
    emit('update:text', e.getText())
  },
  onFocus: () => { isFocused.value = true },
  onBlur: () => { isFocused.value = false },
})

// Sync external changes
watch(() => props.modelValue, (val) => {
  if (!editor.value) return
  const current = editor.value.getHTML()
  if (val !== current && val !== (current === '<p></p>' ? '' : current)) {
    editor.value.commands.setContent(val || '', false)
  }
})

watch(() => props.disabled, (val) => {
  editor.value?.setEditable(!val)
})

const charCount = computed(() => {
  if (!editor.value || !props.maxLength) return null
  return editor.value.storage.characterCount?.characters() || 0
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<template>
  <div :class="['rich-editor', { 'rich-editor--disabled': disabled, 'rich-editor--focused': isFocused }]">
    <!-- Toolbar for rich/mention modes (shows on focus) -->
    <Transition name="toolbar-slide">
      <div v-if="editor && isRich && isFocused" class="rich-editor__toolbar">
        <button
          :class="['rich-editor__toolbar-btn', { 'rich-editor__toolbar-btn--active': editor.isActive('bold') }]"
          @mousedown.prevent="editor.chain().focus().toggleBold().run()"
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          :class="['rich-editor__toolbar-btn', { 'rich-editor__toolbar-btn--active': editor.isActive('italic') }]"
          @mousedown.prevent="editor.chain().focus().toggleItalic().run()"
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          :class="['rich-editor__toolbar-btn', { 'rich-editor__toolbar-btn--active': editor.isActive('strike') }]"
          @mousedown.prevent="editor.chain().focus().toggleStrike().run()"
          title="Strikethrough"
        >
          <s>S</s>
        </button>
        <div class="rich-editor__toolbar-divider" />
        <button
          :class="['rich-editor__toolbar-btn', { 'rich-editor__toolbar-btn--active': editor.isActive('bulletList') }]"
          @mousedown.prevent="editor.chain().focus().toggleBulletList().run()"
          title="Bullet list"
        >
          <Icon name="lucide:list" size="14" />
        </button>
        <button
          :class="['rich-editor__toolbar-btn', { 'rich-editor__toolbar-btn--active': editor.isActive('orderedList') }]"
          @mousedown.prevent="editor.chain().focus().toggleOrderedList().run()"
          title="Numbered list"
        >
          <Icon name="lucide:list-ordered" size="14" />
        </button>
        <template v-if="hasMentions">
          <div class="rich-editor__toolbar-divider" />
          <span class="rich-editor__toolbar-hint">
            <Icon name="lucide:hash" size="12" />
            {{ $t('editor.mentions.title') }}
          </span>
        </template>
      </div>
    </Transition>

    <!-- Editor content -->
    <EditorContent :editor="editor" />

    <!-- Mention suggestions dropdown -->
    <Transition name="fade">
      <MentionList
        v-if="showMention && mentionProps"
        :items="mentionProps.items"
        :command="selectMention"
        @keyhandler="setMentionKeyHandler"
      />
    </Transition>

    <!-- Character count -->
    <div v-if="maxLength > 0 && charCount !== null" class="rich-editor__counter">
      <span :class="{ 'rich-editor__counter--over': charCount >= maxLength }">{{ charCount }}/{{ maxLength }}</span>
    </div>
  </div>
</template>

<style scoped>
.rich-editor {
  position: relative;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.rich-editor--focused {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-accent) 15%, transparent);
}

.rich-editor--disabled {
  opacity: 0.6;
  pointer-events: none;
}

/* Toolbar */
.rich-editor__toolbar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px 8px;
  border-bottom: 1px solid var(--color-border-light);
  background: color-mix(in srgb, var(--color-text-primary) 2%, transparent);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.rich-editor__toolbar-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: var(--text-sm);
  font-family: var(--font-family);
  transition: all var(--transition-fast);
}

.rich-editor__toolbar-btn:hover {
  color: var(--color-text-primary);
  background: color-mix(in srgb, var(--color-text-primary) 6%, transparent);
}

.rich-editor__toolbar-btn--active {
  color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
}

.rich-editor__toolbar-divider {
  width: 1px;
  height: 16px;
  background: var(--color-border-light);
  margin: 0 4px;
}

.rich-editor__toolbar-hint {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--color-text-muted);
  margin-left: auto;
}

/* Editor content */
.rich-editor :deep(.rich-editor__content) {
  padding: var(--space-3);
  outline: none;
  font-size: var(--text-base);
  font-family: var(--font-family);
  color: var(--color-text-primary);
  line-height: 1.6;
}

.rich-editor :deep(.rich-editor__content p) {
  margin: 0;
}

.rich-editor :deep(.rich-editor__content p + p) {
  margin-top: 0.5em;
}

.rich-editor :deep(.rich-editor__content ul),
.rich-editor :deep(.rich-editor__content ol) {
  padding-left: 1.5em;
  margin: 0.5em 0;
}

.rich-editor :deep(.rich-editor__content h2) {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
  margin: 0.75em 0 0.25em;
}

.rich-editor :deep(.rich-editor__content h3) {
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  margin: 0.5em 0 0.25em;
}

/* Placeholder */
.rich-editor :deep(.tiptap p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: var(--color-text-muted);
  pointer-events: none;
  height: 0;
}

/* Links */
.rich-editor :deep(.rich-editor__link) {
  color: var(--color-accent);
  text-decoration: underline;
  cursor: pointer;
}

/* Mentions */
.rich-editor :deep(.rich-editor__mention) {
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-accent) 12%, transparent);
  color: var(--color-accent);
  font-weight: var(--font-weight-medium);
  font-size: 0.9em;
  white-space: nowrap;
}

/* Character counter */
.rich-editor__counter {
  position: absolute;
  bottom: var(--space-1);
  right: var(--space-2);
  font-size: 11px;
  color: var(--color-text-muted);
}

.rich-editor__counter--over {
  color: var(--color-error);
}

/* Transitions */
.toolbar-slide-enter-active,
.toolbar-slide-leave-active {
  transition: all 0.15s ease;
  overflow: hidden;
}

.toolbar-slide-enter-from,
.toolbar-slide-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.toolbar-slide-enter-to,
.toolbar-slide-leave-from {
  max-height: 40px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
