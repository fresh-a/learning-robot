import React from "react";
import { marked } from "marked";
import { markedHighlight } from "marked-highlight"; 
import hljs from "highlight.js";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import "highlight.js/styles/atom-one-dark.css";

// 注册语言
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);

import styles from "./index.module.css";
type IProps = {
  markdownText: string;
};

export const Markdown = (props: IProps) => {

  const markdownText = props.markdownText;
  const html = marked(markdownText);
  marked.use(markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'shell'
      return hljs.highlight(code, { language }).value
    }
  }))
  hljs.highlightAll();

  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      className={styles.mark}
    ></div>
  );
};
