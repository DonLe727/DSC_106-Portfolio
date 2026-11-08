import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

async function loadData() {
  const data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line), // or just +row.line
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));

  return data;
}

const data = await loadData();

function processCommits(data) {
  commits = d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      // All lines in a commit have the same author, date, etc.
      // So we can get this information from the first line
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;

      // Create an object with the metadata we want
      let ret = {
        id: commit,
        url: 'https://github.com/DonLe727/DSC_106-Portfolio/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        // Calculate the hour as a decimal for time analysis later
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        // The number of lines edited is just the length of the array
        totalLines: lines.length,
      };

      // Hide the lines array as a non-enumerable property (keeps console logs clean)
      Object.defineProperty(ret, 'lines', {
        value: lines,
        configurable: true,
        writable: true,
        enumerable: false,
      });

      return ret;
    });
}

function renderCommitInfo(data, commits) {
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);

  dl.append('dt').text('Files');
  dl.append('dd').text(d3.group(data, (d) => d.file).size);

  dl.append('dt').text('Longest line');
  dl.append('dd').text(d3.max(data, (d) => d.length));

  dl.append('dt').text('Max depth');
  dl.append('dd').text(d3.max(data, (d) => d.depth));

  // average file length = mean of each file's biggest line number
  const fileLengths = d3.rollups(data, (v) => d3.max(v, (d) => d.line), (d) => d.file);
  dl.append('dt').text('Avg file length');
  dl.append('dd').text(d3.mean(fileLengths, (d) => d[1]).toFixed(1));
}

const commits = processCommits(data);
renderCommitInfo(data, commits);
