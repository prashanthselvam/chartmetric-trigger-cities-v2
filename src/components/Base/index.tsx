import React, { FC, ReactNode } from 'react';

interface TextProps {
  children: ReactNode;
  className?: string;
}

const P: FC<TextProps> = ({ children, className }) => <p className={`base-text ${className || ''}`}>{children}</p>;

const H1: FC<TextProps> = ({ children, className }) => <h1 className={`base-text ${className || ''}`}>{children}</h1>;

const H2: FC<TextProps> = ({ children, className }) => <h2 className={`base-text ${className || ''}`}>{children}</h2>;

const H3: FC<TextProps> = ({ children, className }) => <h3 className={`base-text ${className || ''}`}>{children}</h3>;

const H4: FC<TextProps> = ({ children, className }) => <h4 className={`base-text ${className || ''}`}>{children}</h4>;

const FigCaption: FC<TextProps> = ({ children, className }) => (
  <figcaption className={`base-text ${className || ''}`}>{children}</figcaption>
);

export { P, H1, H2, H3, H4, FigCaption };
