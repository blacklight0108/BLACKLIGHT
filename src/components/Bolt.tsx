interface BoltProps {
  className?: string
  style?: React.CSSProperties
  stroke?: boolean
}

/** 闪电符号 —— 全站母题，纯 SVG，零图片 */
export function Bolt({ className = '', style, stroke = false }: BoltProps) {
  return (
    <svg
      viewBox="0 0 100 130"
      className={className}
      style={style}
      aria-hidden="true"
      fill={stroke ? 'none' : 'currentColor'}
      stroke={stroke ? 'currentColor' : 'none'}
      strokeWidth={stroke ? 3 : 0}
      strokeLinejoin="round"
    >
      <path d="M62 1h37L68 47h24L27 129l14-61H11L61 1z" />
    </svg>
  )
}
