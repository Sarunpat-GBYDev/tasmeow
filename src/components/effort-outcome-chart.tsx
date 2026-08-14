import { WeekPoint } from "@/hooks/use-effort-outcome";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Svg, {
  Circle,
  Line,
  Path,
  Rect,
  Text as SvgText,
} from "react-native-svg";

const CHART_HEIGHT = 180;
const PADDING_TOP = 12;
const PADDING_BOTTOM = 24;
const PADDING_LEFT = 28;
const PADDING_RIGHT = 28;

export function EffortOutcomeChart({
  points,
  color,
  metricName,
  metricUnit,
}: {
  points: WeekPoint[];
  color: string;
  metricName: string;
  metricUnit: string | null;
}) {
  const chartWidth = Dimensions.get("window").width - 40 - 36; // 40 = screen pad, 36 = card pad
  const plotW = chartWidth - PADDING_LEFT - PADDING_RIGHT;
  const plotH = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const step = plotW / (points.length - 1);

  const efforts = points.map((p) => p.effortHours);
  const maxEffort = Math.max(1, ...efforts);

  const outcomes = points
    .map((p) => p.outcomeValue)
    .filter((v): v is number => v !== null);
  const hasOutcome = outcomes.length > 0;
  const minOutcome = hasOutcome ? Math.min(...outcomes) : 0;
  const maxOutcome = hasOutcome ? Math.max(...outcomes) : 1;
  const outcomeRange = maxOutcome - minOutcome || 1;

  // helper: แปลง (index, value) → พิกัดใน SVG
  const xAt = (i: number) => PADDING_LEFT + i * step;
  const yOfEffort = (v: number) =>
    PADDING_TOP + plotH - (v / maxEffort) * plotH;
  const yOfOutcome = (v: number) =>
    PADDING_TOP + plotH - ((v - minOutcome) / outcomeRange) * plotH;

  // สร้าง path ของเส้น outcome (ต่อจุดที่มีค่าเท่านั้น)
  let outcomePath = "";
  points.forEach((p, i) => {
    if (p.outcomeValue === null) return;
    const cmd = outcomePath === "" ? "M" : "L";
    outcomePath += `${cmd}${xAt(i)},${yOfOutcome(p.outcomeValue)} `;
  });

  // แสดง label เดือนใต้แท่งที่ 0, 6, 11 (กันเลขล้น)
  const labelIndices = [0, Math.floor(points.length / 2), points.length - 1];

  return (
    <View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#D1D5DB" }]} />
          <Text style={styles.legendText}>เวลาที่ทำ (ชม./สัปดาห์)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: color }]} />
          <Text style={styles.legendText}>
            {metricName}
            {metricUnit ? ` (${metricUnit})` : ""}
          </Text>
        </View>
      </View>

      <Svg width={chartWidth} height={CHART_HEIGHT}>
        {/* baseline */}
        <Line
          x1={PADDING_LEFT}
          y1={PADDING_TOP + plotH}
          x2={PADDING_LEFT + plotW}
          y2={PADDING_TOP + plotH}
          stroke="#E5E7EB"
          strokeWidth={1}
        />

        {/* effort bars */}
        {points.map((p, i) => {
          const barW = Math.max(4, step * 0.5);
          const barX = xAt(i) - barW / 2;
          const barY = yOfEffort(p.effortHours);
          const barH = PADDING_TOP + plotH - barY;
          return (
            <Rect
              key={`bar-${i}`}
              x={barX}
              y={barY}
              width={barW}
              height={barH}
              fill="#D1D5DB"
              rx={2}
            />
          );
        })}

        {/* outcome line */}
        {outcomePath !== "" && (
          <Path
            d={outcomePath}
            fill="none"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* outcome dots */}
        {points.map((p, i) =>
          p.outcomeValue !== null ? (
            <Circle
              key={`dot-${i}`}
              cx={xAt(i)}
              cy={yOfOutcome(p.outcomeValue)}
              r={4}
              fill={color}
              stroke="white"
              strokeWidth={2}
            />
          ) : null,
        )}

        {/* x-axis labels */}
        {labelIndices.map((i) => (
          <SvgText
            key={`label-${i}`}
            x={xAt(i)}
            y={CHART_HEIGHT - 6}
            fill="#9CA3AF"
            fontSize={10}
            textAnchor="middle"
          >
            {points[i].label}
          </SvgText>
        ))}
      </Svg>

      {!hasOutcome && (
        <Text style={styles.emptyHint}>
          ยังไม่มีการบันทึกค่า metric — บันทึกไว้จะเห็นเส้นเทียบกับเวลาที่ทำ
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: { width: 10, height: 10, borderRadius: 2 },
  legendLine: { width: 16, height: 3, borderRadius: 2 },
  legendText: { fontSize: 11, color: "#6B7280" },
  emptyHint: {
    color: "#9CA3AF",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
});
