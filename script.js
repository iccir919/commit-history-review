document.getElementById("submit").onclick = getGithubActivity;

function getGithubActivity(e) {
  e.preventDefault();
  const username = document.getElementById("username").value;
  if (!username) {
    alert("Please enter a Github username.")
    return;
  }

  /*
    Fetching up to a total of 300 events is supported
    100 items maximum
  */
  const githubRequests = ["1", "2", "3"].map(page => {
      return fetch(`https://api.github.com/users/${username}/events/public?per_page=100&page=${page}`)
        .then(res => res.json())
        .then(data => data)
        .catch(e => e)
  });

  Promise.all(githubRequests)
    .then(response => {
      const githubHistory = [].concat.apply([], response);
      analyze(githubHistory);
    })
    .catch(error => console.log(`Error in executing ${error}`))
}

function analyze(githubHistory) {
  if (githubHistory.length === 0) display(null);
  const analysis = {
    type: githubHistory.length === 300 ? "past 300 commits" : "past 90 days",
    dateMap: getHistoryDateMap(githubHistory),
    endDate: new Date(githubHistory[0].created_at),
    startDate: new Date(githubHistory[githubHistory.length - 1].created_at),
    longestStreak: calculateLongestStreak(Object.keys(getHistoryDateMap(githubHistory)).reverse())
  }
  display(analysis);
}

function display(analysis) {
  document.getElementsByTagName("form")[0].style.display = "none";


  let html = ""
  if (analysis === null) {
    html += `<h2>No public Github activity to displaygi for this profile.</h2>`
  } else {
    html +=  `
      ${displayDateAnalysis(analysis)}
      <h3>...your longest Github public activity streak has been ${analysis.longestStreak} days in a row!</h3>
    `
  }


  const analysisElement = document.createElement("div");
  analysisElement.innerHTML = html;
  analysisElement.setAttribute("id", "analysis");
  document.getElementById("container").appendChild(analysisElement)

}

function displayDateAnalysis({ startDate, endDate, dateMap, type }) {
  const daysActive = Object.keys(dateMap).length;
  let result = "";
  if (type === "past 300 commits") {

    const daysBetween = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
    result += `<h2>Between ${startDate.toDateString()} and ${endDate.toDateString()}, a total of ${daysBetween} days...</h2>`
  } else {
    result += `<h2>In the past 90 days...</h2>`
  }
  result += `<h3>...<strong>you</strong> were publically active on Github ${daysActive} of those days!`;
  return result;
}

function getHistoryDateMap(githubHistory) {
  return githubHistory.reduce((accum, curr) => {
    const date = new Date(curr.created_at).toDateString();
    if (accum[date]) {
      accum[date].push(curr);
    } else {
      accum[date] = [curr];
    }

    return accum;
  }, {});
}

function calculateLongestStreak(dates) {
  let longest = 0;
  let index = 0;

  while (index < dates.length) {
    let currentStreak = 0;
    let currentDate = new Date(dates[index]);
    let dataDate = new Date(dates[index]);
    while(currentDate.getTime() === dataDate.getTime()) {
      currentStreak++;
      index++;
      dataDate = new Date(dates[index]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    if (currentStreak > longest) longest = currentStreak;
  }
  return longest
}
