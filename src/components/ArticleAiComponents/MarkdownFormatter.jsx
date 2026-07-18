import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

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
      <div className="relative my-6 rounded-2xl overflow-hidden border border-slate-200 shadow-lg bg-[#1e1e1e]">
        <div className="flex items-center justify-between px-5 py-3 bg-[#2d2d2d] border-b border-slate-700">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {language}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
        <div className="overflow-x-auto">
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={language}
            PreTag="div"
            customStyle={{
              margin: 0,
              padding: '1.5rem',
              background: 'transparent',
              fontSize: '0.95rem',
              lineHeight: '1.6',
            }}
            {...props}
          >
            {codeString}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  }

  return (
    <code
      className="bg-slate-100 text-rose-500 rounded-lg px-2 py-1 text-sm font-mono border border-slate-200"
      {...props}
    >
      {children}
    </code>
  );
};

const MarkdownFormatter = ({ text, isUser = false }) => {
  const textColor = isUser ? 'text-white' : 'text-slate-800';
  const mutedTextColor = isUser ? 'text-indigo-100' : 'text-slate-700';
  const headingColor = isUser ? 'text-white' : 'text-slate-900';
  const borderColor = isUser ? 'border-white/20' : 'border-slate-100';

  return (
    <div className={`w-full leading-relaxed text-base article-content ${textColor}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className={`text-2xl font-extrabold mt-6 mb-3 tracking-tight border-b-2 pb-2 ${headingColor} ${borderColor}`} {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className={`text-xl font-bold mt-5 mb-2 tracking-tight ${headingColor}`} {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className={`text-lg font-bold mt-4 mb-2 tracking-tight ${headingColor}`} {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className={`mb-3 last:mb-0 leading-relaxed ${mutedTextColor}`} {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-6 mb-4 space-y-1 marker:text-indigo-400 font-medium" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-6 mb-4 space-y-1 marker:text-indigo-400 font-medium" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="pl-1" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a 
              className={`${isUser ? 'text-white underline' : 'text-indigo-600 hover:text-indigo-800'} underline decoration-indigo-200 underline-offset-4 font-bold transition-all`} 
              target="_blank" 
              rel="noopener noreferrer" 
              {...props} 
            />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className={`border-l-4 ${isUser ? 'border-white/40 bg-white/10' : 'border-indigo-500 bg-slate-50'} pl-4 py-3 my-4 italic rounded-r-2xl text-lg font-serif ${textColor}`} {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className={`my-6 w-full overflow-x-auto rounded-xl border shadow-lg shadow-slate-100 ${isUser ? 'border-white/20' : 'border-slate-200'}`}>
              <table className="w-full text-left text-sm border-collapse" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className={`${isUser ? 'bg-white/10 text-white border-white/20' : 'bg-slate-50 text-slate-900 border-slate-200'} border-b`} {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-2 font-bold uppercase tracking-widest text-[10px]" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className={`divide-y ${isUser ? 'divide-white/10 bg-white/5' : 'divide-slate-100 bg-white'}`} {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className={`${isUser ? 'hover:bg-white/10' : 'hover:bg-slate-50/50'} transition-colors`} {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className={`px-4 py-3 align-top font-medium ${mutedTextColor}`} {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className={`my-6 ${isUser ? 'border-white/20' : 'border-slate-200'}`} {...props} />
          ),
          code: CodeBlock
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownFormatter;
