interface Props {
    className?: string;
}

import * as React from "react"
import Svg, { Defs, LinearGradient, Stop, Rect, G } from "react-native-svg"
/* SVGR has dropped some elements not supported by react-native-svg: filter */
const SvgComponent = (Props: Props) => (
  <Svg width={100} height={100} viewBox="0 0 250 250" {...Props}>
    <Defs>
      <LinearGradient id="b" x1="0%" x2="100%" y1="0%" y2="100%">
        <Stop offset="0%" stopColor="#f0f" />
        <Stop offset="100%" stopColor="#63e" />
      </LinearGradient>
    </Defs>
    <Rect width={250} height={250} fill="#0a0a0a" rx={55} />
    <Rect
      width={246}
      height={246}
      x={2}
      y={2}
      fill="none"
      stroke="#262626"
      strokeWidth={2}
      rx={53}
    />
    <G fill="url(#b)" filter="url(#a)">
      <Rect width={16} height={50} x={65} y={100} rx={8} />
      <Rect width={16} height={120} x={95} y={65} rx={8} />
      <Rect width={16} height={170} x={125} y={40} rx={8} />
      <Rect width={16} height={90} x={155} y={80} rx={8} />
      <Rect width={16} height={40} x={185} y={105} rx={8} />
    </G>
  </Svg>
)
export default SvgComponent
