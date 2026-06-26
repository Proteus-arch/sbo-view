const TrendArrow = ({ current, prior, invert = false }) => {
  // invert=true means DOWN is good (e.g., days to get paid after a sale, debt ratios)
  // invert=false means UP is good (e.g., margins, runway)
  const change = ((current - prior) / Math.abs(prior)) * 100;
  const isUp = change > 0;
  const isGood = invert ? !isUp : isUp;
  // Green = good direction, Red = bad direction
};