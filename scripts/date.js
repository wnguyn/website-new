const MONTHS = ["jan.", "feb.", "mar.", "apr.", "may.", "jun.", "jul.", "aug.", "sep.", "oct.", "nov.", "dec."];
const DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function formatDate(date) {
	return `${DAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

document.addEventListener("DOMContentLoaded", () => {
	const stamp = document.querySelector(".date-stamp");
	if (stamp) stamp.textContent = formatDate(new Date());
});