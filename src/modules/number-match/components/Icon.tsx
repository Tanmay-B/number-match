import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg'

/**
 * Line icons drawn on a 24x24 grid with a 2px round stroke, matching the
 * Tabler style used in the design. Kept as inline SVG so the app needs no
 * icon font and no native linking.
 */
export type IconName =
  | 'coin'
  | 'plusCircle'
  | 'flame'
  | 'settings'
  | 'infoCircle'
  | 'gift'
  | 'play'
  | 'pause'
  | 'home'
  | 'chart'
  | 'palette'
  | 'bulb'
  | 'undo'
  | 'shuffle'
  | 'plus'
  | 'chevronLeft'
  | 'chevronRight'
  | 'lock'
  | 'alert'
  | 'share'
  | 'star'
  | 'file'
  | 'crown'
  | 'puzzle'
  | 'volume'
  | 'music'
  | 'vibrate'
  | 'moon'
  | 'sun'
  | 'check'

type IconProps = {
  name: IconName
  color: string
  size?: number
  strokeWidth?: number
}

export function Icon({
  name,
  color,
  size = 20,
  strokeWidth = 2,
}: IconProps) {
  return (
    <Svg height={size} viewBox="0 0 24 24" width={size}>
      {renderPaths(name, buildStroke(color, strokeWidth), color)}
    </Svg>
  )
}

type StrokeProps = ReturnType<typeof buildStroke>

function buildStroke(color: string, strokeWidth: number) {
  return {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  }
}

function renderPaths(name: IconName, s: StrokeProps, color: string) {
  switch (name) {
    case 'coin':
      return (
        <>
          <Circle {...s} cx={12} cy={12} r={9} />
          <Circle {...s} cx={12} cy={12} r={4} />
        </>
      )
    case 'plusCircle':
      return (
        <>
          <Circle {...s} cx={12} cy={12} r={9} />
          <Line {...s} x1={12} x2={12} y1={8} y2={16} />
          <Line {...s} x1={8} x2={16} y1={12} y2={12} />
        </>
      )
    case 'flame':
      return (
        <Path
          {...s}
          d="M12 3c1.5 3 4.5 4.5 4.5 8a4.5 4.5 0 0 1-9 0c0-1.2.4-2 1-2.8.3 1 1 1.6 1.8 1.6C10.2 7.5 11 5 12 3Z"
        />
      )
    case 'settings':
      return (
        <>
          <Circle {...s} cx={12} cy={12} r={3.2} />
          <Path
            {...s}
            d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6"
          />
        </>
      )
    case 'infoCircle':
      return (
        <>
          <Circle {...s} cx={12} cy={12} r={9} />
          <Line {...s} x1={12} x2={12} y1={11} y2={16} />
          <Line {...s} x1={12} x2={12.01} y1={8} y2={8} />
        </>
      )
    case 'gift':
      return (
        <>
          <Rect {...s} height={4} rx={1} width={16} x={4} y={8} />
          <Path {...s} d="M6 12v7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-7" />
          <Line {...s} x1={12} x2={12} y1={8} y2={20} />
          <Path
            {...s}
            d="M12 8C12 8 11 4 8.5 4a2 2 0 0 0 0 4M12 8c0 0 1-4 3.5-4a2 2 0 0 1 0 4"
          />
        </>
      )
    case 'play':
      return <Path d="M8 5.5v13l11-6.5Z" fill={color} />
    case 'pause':
      return (
        <>
          <Rect fill={color} height={14} rx={1.2} width={4} x={7} y={5} />
          <Rect fill={color} height={14} rx={1.2} width={4} x={13} y={5} />
        </>
      )
    case 'home':
      return (
        <>
          <Polyline {...s} points="4 11 12 4 20 11" />
          <Path {...s} d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" />
        </>
      )
    case 'chart':
      return (
        <>
          <Line {...s} x1={5} x2={5} y1={20} y2={12} />
          <Line {...s} x1={12} x2={12} y1={20} y2={5} />
          <Line {...s} x1={19} x2={19} y1={20} y2={9} />
        </>
      )
    case 'palette':
      return (
        <>
          <Path
            {...s}
            d="M12 3a9 9 0 1 0 0 18 2 2 0 0 0 1.6-3.2 2 2 0 0 1 1.6-3.2H18a3 3 0 0 0 3-3 9 9 0 0 0-9-8.6Z"
          />
          <Circle cx={8} cy={11} fill={color} r={1.2} />
          <Circle cx={11} cy={7.5} fill={color} r={1.2} />
          <Circle cx={15.5} cy={9} fill={color} r={1.2} />
        </>
      )
    case 'bulb':
      return (
        <>
          <Path {...s} d="M9.5 15a5 5 0 1 1 5 0v1.5h-5V15Z" />
          <Line {...s} x1={10} x2={14} y1={19} y2={19} />
        </>
      )
    case 'undo':
      return (
        <>
          <Polyline {...s} points="8 8 4 12 8 16" />
          <Path {...s} d="M4 12h9a5 5 0 0 1 0 10h-2" />
        </>
      )
    case 'shuffle':
      return (
        <>
          <Path {...s} d="M4 7h3.5l9 10H20M4 17h3.5l9-10H20" />
          <Polyline {...s} points="17 4 20 7 17 10" />
          <Polyline {...s} points="17 14 20 17 17 20" />
        </>
      )
    case 'plus':
      return (
        <>
          <Line {...s} x1={12} x2={12} y1={5} y2={19} />
          <Line {...s} x1={5} x2={19} y1={12} y2={12} />
        </>
      )
    case 'chevronLeft':
      return <Polyline {...s} points="15 5 8 12 15 19" />
    case 'chevronRight':
      return <Polyline {...s} points="9 5 16 12 9 19" />
    case 'lock':
      return (
        <>
          <Rect {...s} height={10} rx={2} width={13} x={5.5} y={11} />
          <Path {...s} d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3" />
        </>
      )
    case 'alert':
      return (
        <>
          <Path {...s} d="M12 4.5 21 20H3Z" />
          <Line {...s} x1={12} x2={12} y1={10} y2={14} />
          <Line {...s} x1={12} x2={12.01} y1={17} y2={17} />
        </>
      )
    case 'share':
      return (
        <>
          <Circle {...s} cx={6} cy={12} r={2.5} />
          <Circle {...s} cx={17} cy={6} r={2.5} />
          <Circle {...s} cx={17} cy={18} r={2.5} />
          <Line {...s} x1={8.2} x2={14.8} y1={10.9} y2={7.2} />
          <Line {...s} x1={8.2} x2={14.8} y1={13.1} y2={16.8} />
        </>
      )
    case 'star':
      return (
        <Path
          {...s}
          d="m12 4 2.5 5.1 5.6.8-4 4 .9 5.6-5-2.7-5 2.7.9-5.6-4-4 5.6-.8Z"
        />
      )
    case 'file':
      return (
        <>
          <Path {...s} d="M6 3h8l4 4v14H6Z" />
          <Polyline {...s} points="14 3 14 7 18 7" />
          <Line {...s} x1={9} x2={15} y1={12} y2={12} />
          <Line {...s} x1={9} x2={15} y1={16} y2={16} />
        </>
      )
    case 'crown':
      return (
        <>
          <Path {...s} d="M4 8l3.5 3L12 5l4.5 6L20 8l-1.5 10h-13Z" />
          <Line {...s} x1={6} x2={18} y1={20.5} y2={20.5} />
        </>
      )
    case 'puzzle':
      return (
        <Path
          {...s}
          d="M10 4h4v2a2 2 0 1 0 4 0h2v4h-2a2 2 0 1 0 0 4h2v4h-4v-2a2 2 0 1 0-4 0v2H6v-4h2a2 2 0 1 0 0-4H6V6h4Z"
        />
      )
    case 'volume':
      return (
        <>
          <Path {...s} d="M5 9.5h3L12 6v12l-4-3.5H5Z" />
          <Path {...s} d="M16 9.5a3.5 3.5 0 0 1 0 5M18.5 7a7 7 0 0 1 0 10" />
        </>
      )
    case 'music':
      return (
        <>
          <Circle {...s} cx={7} cy={17} r={2.5} />
          <Circle {...s} cx={17} cy={15} r={2.5} />
          <Path {...s} d="M9.5 17V7l10-2v10" />
        </>
      )
    case 'vibrate':
      return (
        <>
          <Rect {...s} height={16} rx={2} width={9} x={7.5} y={4} />
          <Path {...s} d="M4 9.5v5M20 9.5v5" />
        </>
      )
    case 'moon':
      return <Path {...s} d="M19 14.5A8 8 0 0 1 9.5 5a8 8 0 1 0 9.5 9.5Z" />
    case 'sun':
      return (
        <>
          <Circle {...s} cx={12} cy={12} r={4} />
          <Path
            {...s}
            d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"
          />
        </>
      )
    case 'check':
      return <Polyline {...s} points="5 12.5 10 17.5 19 6.5" />
    default:
      return null
  }
}
