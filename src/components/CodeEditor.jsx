import Editor from '@monaco-editor/react'

function CodeEditor({ value, onChange, language = 'javascript' }) {
  return (
    <Editor
      height="60vh"
      language={language}
      value={value}
      onChange={(newValue) => onChange(newValue ?? '')}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        automaticLayout: true,
        tabSize: 2,
      }}
    />
  )
}

export default CodeEditor