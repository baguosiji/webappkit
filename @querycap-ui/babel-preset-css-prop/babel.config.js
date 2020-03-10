const r = (pkg) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires,no-undef
  const m = require(pkg);
  return m.default || m;
};

const autoImportEmotionJSXIFNeed = (api) => {
  const t = api.types;

  const pragmaName = "___EmotionJSX";
  const pragmaFragName = "___Fragment";

  const findLast = (arr, predicate) => {
    for (let i = arr.length - 1; i >= 0; i--) {
      if (predicate(arr[i])) {
        return arr[i];
      }
    }
  };

  const addPragmaImport = (path, opts) => {
    const importDeclar = t.importDeclaration(
      [t.importSpecifier(t.identifier(opts.import), t.identifier(opts.export || "default"))],
      t.stringLiteral(opts.module),
    );

    const targetPath = findLast(path.get("body"), (p) => p.isImportDeclaration());

    if (targetPath) {
      targetPath.insertAfter([importDeclar]);
    } else {
      // Apparently it's now safe to do this even if Program begins with directives.
      path.unshiftContainer("body", importDeclar);
    }
  };

  const createComponentBlock = (value) => ({
    type: "CommentBlock",
    value,
  });

  return {
    name: "auto-import-emotion-jsx-if-need",
    inherits: r("@babel/plugin-syntax-jsx"),
    visitor: {
      Program: {
        enter: function(path, state) {
          let needEmotion = false;

          path.traverse({
            JSXAttribute(path) {
              if (path.get("name").node.name === "css") {
                needEmotion = true;
              }
            },
          });

          if (needEmotion) {
            const { file } = state;

            addPragmaImport(path, {
              module: "@emotion/core",
              export: "jsx",
              import: pragmaName,
            });

            addPragmaImport(path, {
              module: "react",
              export: "Fragment",
              import: pragmaFragName,
            });

            file.ast.comments.push(
              createComponentBlock(`@jsx ${pragmaName}`),
              createComponentBlock(`@jsxFrag ${pragmaFragName}`),
            );
          }
        },
      },
    },
  };
};

module.exports = (_, { sourceMap, autoLabel, labelFormat, instances }) => ({
  plugins: [
    autoImportEmotionJSXIFNeed,
    r("@babel/plugin-transform-react-jsx"),
    [
      r("babel-plugin-emotion"),
      {
        sourceMap,
        autoLabel,
        labelFormat,
        instances,
        cssPropOptimization: true,
      },
    ],
  ],
});
