import React from 'react'

export const Stage = React.forwardRef(({ children, ...props }: any, ref: any) => (
  <div data-testid="stage" className={props.className} ref={ref}>{children}</div>
))
Stage.displayName = 'Stage'

export const Layer = ({ children }: any) => <div data-testid="layer">{children}</div>
export const Group = ({ children, ...props }: any) => (
  <div data-testid="group" data-x={props.x} data-y={props.y}>{children}</div>
)
export const Rect = (props: any) => <div data-testid="rect" data-fill={props.fill} />
export const Text = ({ text }: any) => <span data-testid="konva-text">{text}</span>
export const Circle = (_props: any) => <div data-testid="circle" />
