export const clamp = (x, min, max) => Math.min(Math.max(x, min), max);

export const fadeTo = (pt, from, to = 0, rate = 0.05) => {
  if (pt.fade === undefined) pt.fade = 1;
	if (from > 0) pt.fade = from;
	if (pt.fade !== 0) pt.fade += (to - pt.fade) * rate;

	return pt.fade || 0
};
