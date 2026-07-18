import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, BookOpen } from 'lucide-react';

/**
 * Renders a highlighted source citation badge.
 */
const SourceBadge = ({ text }) => (
  <span
    className="source-citation-badge"
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '2px 8px',
      margin: '0 2px',
      borderRadius: '6px',
      background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
      border: '1px solid #c7d2fe',
      color: '#4338ca',
      fontSize: '0.8em',
      fontWeight: 600,
      lineHeight: 1.5,
      // whiteSpace: 'nowrap',
      verticalAlign: 'baseline',
      transition: 'all 0.2s ease',
    }}
    title={text}
  >
    <BookOpen style={{ width: '12px', height: '12px', flexShrink: 0 }} />
    <span>{text}</span>
  </span>
);

/**
 * Splits a text string on source citation patterns and returns
 * an array of React elements with SourceBadge components for matches.
 */
const SOURCE_REGEX = /\(Source:\s*[^)]+\)/g;

const highlightSources = (text) => {
  if (typeof text !== 'string') return text;
  const parts = [];
  let lastIndex = 0;
  let match;
  const regex = new RegExp(SOURCE_REGEX.source, 'g');

  while ((match = regex.exec(text)) !== null) {
    // Text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    // The source citation (strip outer parentheses for cleaner display)
    const citation = match[0].slice(1, -1); // Remove ( and )
    parts.push(<SourceBadge key={`src-${match.index}`} text={citation} />);
    lastIndex = regex.lastIndex;
  }

  // Remaining text after last match
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
};

const CodeBlock = ({ inline, className, children, ...props }) => {
  const [isCopied, setIsCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : 'text';
  const codeString = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!inline && match) {
    return (
      <div className="relative my-4 rounded-lg overflow-hidden border border-gray-700/50 shadow-sm bg-[#1e1e1e]">
        {/* Code Header with Language and Copy Button */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-gray-700">
          <span className="text-xs font-medium text-gray-300 uppercase tracking-wider">
            {language}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy code</span>
              </>
            )}
          </button>
        </div>
        {/* Syntax Highlighter */}
        <div className="overflow-x-auto">
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={language}
            PreTag="div"
            customStyle={{
              margin: 0,
              padding: '1rem',
              background: 'transparent',
              fontSize: '0.9rem',
              lineHeight: '1.5',
            }}
            {...props}
          >
            {codeString}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  }

  // Inline Code (e.g., `const x = 1`)
  return (
    <code
      className="bg-gray-100 text-red-500 rounded px-1.5 py-0.5 text-sm font-mono border border-gray-200"
      {...props}
    >
      {children}
    </code>
  );
};

/**
 * Recursively processes React children to highlight source citations
 * within text nodes. Non-string children are returned as-is.
 */
const processChildren = (children) => {
  if (typeof children === 'string') {
    return highlightSources(children);
  }
  if (Array.isArray(children)) {
    return children.map((child, idx) => {
      if (typeof child === 'string') {
        const result = highlightSources(child);
        return Array.isArray(result)
          ? result.map((part, i) =>
              typeof part === 'string' ? part : React.cloneElement(part, { key: `${idx}-${i}` })
            )
          : result;
      }
      if (React.isValidElement(child) && child.props.children) {
        return React.cloneElement(child, {
          ...child.props,
          key: child.key || idx,
          children: processChildren(child.props.children),
        });
      }
      return child;
    }).flat();
  }
  if (React.isValidElement(children) && children.props.children) {
    return React.cloneElement(children, {
      ...children.props,
      children: processChildren(children.props.children),
    });
  }
  return children;
};

const MarkdownFormatter = ({ text }) => {
  return (
    <div className="w-full text-gray-800 leading-7 text-[15px]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]} // Key for Tables
        components={{
          // --- Headings ---
          h1: ({ node, children, ...props }) => (
            <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-4 pb-2 border-b border-gray-200" {...props}>
              {processChildren(children)}
            </h1>
          ),
          h2: ({ node, children, ...props }) => (
            <h2 className="text-xl font-bold text-gray-900 mt-5 mb-3" {...props}>
              {processChildren(children)}
            </h2>
          ),
          h3: ({ node, children, ...props }) => (
            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2" {...props}>
              {processChildren(children)}
            </h3>
          ),
          
          // --- Paragraphs ---
          p: ({ node, children, ...props }) => (
            <p className="mb-3 last:mb-0 leading-relaxed break-words" {...props}>
              {processChildren(children)}
            </p>
          ),
          
          // --- Lists ---
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-6 mb-4 space-y-1 marker:text-gray-400" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-6 mb-4 space-y-1 marker:text-gray-500" {...props} />
          ),
          li: ({ node, children, ...props }) => (
            <li className="pl-1" {...props}>
              {processChildren(children)}
            </li>
          ),
          
          // --- Links ---
          a: ({ node, ...props }) => (
            <a 
              className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors" 
              target="_blank" 
              rel="noopener noreferrer" 
              {...props} 
            />
          ),
          
          // --- Blockquotes ---
          blockquote: ({ node, children, ...props }) => (
            <blockquote className="border-l-4 border-indigo-400 bg-indigo-50/50 pl-4 py-2 my-4 text-gray-700 italic rounded-r-lg" {...props}>
              {processChildren(children)}
            </blockquote>
          ),

          // --- Tables (Critical for your API data) ---
          table: ({ node, ...props }) => (
            <div className="my-6 w-full overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full text-left text-sm border-collapse" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-gray-50 text-gray-700 border-b border-gray-200" {...props} />
          ),
          th: ({ node, children, ...props }) => (
            <th className="px-4 py-3 font-semibold whitespace-nowrap" {...props}>
              {processChildren(children)}
            </th>
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="divide-y divide-gray-100 bg-white" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-gray-50/50 transition-colors" {...props} />
          ),
          td: ({ node, children, ...props }) => (
            <td className="px-4 py-3 align-top text-gray-600" {...props}>
              {processChildren(children)}
            </td>
          ),
          
          // --- Horizontal Rule ---
          hr: ({ node, ...props }) => (
            <hr className="my-6 border-gray-200" {...props} />
          ),
          
          // --- Code Blocks ---
          code: CodeBlock
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownFormatter;