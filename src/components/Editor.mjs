import React, { useRef, useEffect, useState } from "react";
import { styled } from "goober";
require.config({ paths: { vs: "monaco/vs" } });
const path_base =
  window.location.protocol === "file:"
    ? "file://" + window.location.pathname.replace("/index.html", "")
    : window.location.origin;
const proxy = URL.createObjectURL(
  new Blob(
    [
      `
self.MonacoEnvironment = {
      baseUrl: '${path_base}/monaco'
};
      importScripts('${path_base}/monaco/vs/base/worker/workerMain.js');
`,
    ],
    { type: "text/javascript" }
  )
);
window.MonacoEnvironment = { getWorkerUrl: () => proxy };
const Wrapper = styled("div", React.forwardRef)`
  width: 100%;
  height: 100%;
`;
let MONACO_READY = false;
const READY_LIST = [];

require(["vs/editor/editor.main"], function () {
  //eslint-disable-line import/no-amd
  window.monaco.languages.registerCompletionItemProvider("javascript", {
    provideCompletionItems: function (model, position) {
      const list = [
        {
          label: "test",
          kind: 13,
          insertText: "this is a test",
          range: null,
        },
      ];
      return {
        suggestions: list,
        incomplete: false,
      };
    },
  });
  MONACO_READY = true;
  READY_LIST.forEach((item) => item());
});

const Editor = ({ data, onUpdate }) => {
  const [monacoReady, setMonacoReady] = useState(MONACO_READY);
  const ref = useRef();
  const editorRef = useRef(null);

  useEffect(() => {
    if (!MONACO_READY) READY_LIST.push(() => setMonacoReady(true));
  }, []);
  useEffect(() => {
    if (!monacoReady) return;
    if (ref.current && !editorRef.current) {
      const editor = window.monaco.editor.create(ref.current, {
        value:
          data.model_str ||
          `({
                name: "${data.file.name}",
                endianess: "little",
                fields: [],
})`,
        theme: "vs-dark",
        language: "javascript",
        links: false,
        minimap: {
          enabled: false,
        },
        automaticLayout: true,
        suggest: {
          showInlineDetails: false,
          showMethods: false,
          showFunctions: false,
          showConstructors: false,
          showDeprecated: false,
          matchOnWordStartOnly: false,
          showFields: false,
          showVariables: false,
          showClasses: false,
          showStructs: false,
          showInterfaces: false,
          showModules: false,
          showProperties: false,
          showEvents: false,
          showOperators: false,
          showUnits: false,
          showValues: true,
          showConstants: false,
          showEnums: false,
          showEnumMembers: false,
          showKeywords: false,
          showWords: true,
          showColors: false,
          showFiles: false,
          showReferences: false,
          showFolders: false,
          showTypeParameters: false,
          showIssues: false,
          showUsers: false,
          showSnippets: false,
        },
        hover: {
          enable: false,
        },
      });
      editor.onDidBlurEditorWidget(() => {
        console.log("Blur event triggerd !");
        const modal = editor.getModel();
        const text = modal.getValue();
        onUpdate(text);
      });

      editor.addAction({
        label: "Evaluate model",
        contextMenuGroupId: "dv",
        id: "dv_run_model",
        description: "Run this model against the currently active file",
        keybindings: [
          window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.KeyS,
        ],
        run() {
          const modal = editor.getModel();
          const text = modal.getValue();
          onUpdate(text);
        },
      });
      editorRef.current = editor;
      return () => {
        editor.dispose();
        editorRef.current = null;
      };
    }
  }, [ref, editorRef, monacoReady]);

  return <Wrapper ref={ref} />;
};
export default Editor;
