const axios = require("axios");
const cheerio = require("cheerio");
const postEvents = require("../controllers/postEvents");
require("dotenv").config();

async function scrapeAndSortTable(url) {
  try {
    console.log("Fetching webpage...");
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const tableData = [];
    const dateObjects = [];

    const dateRegex =
      /(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+\d+(?:st|nd|rd|th)\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)/i;

    $("table").each((tableIndex, table) => {
      $(table)
        .find("tr")
        .each((rowIndex, row) => {
          $(row)
            .find("td, th")
            .each((cellIndex, cell) => {
              const cellData = {
                text: $(cell).text().trim(),
                links: [],
              };

              $(cell)
                .find("a")
                .each((_, link) => {
                  const href = $(link).attr("href");
                  const linkText = $(link).text().trim();
                  if (href) {
                    cellData.links.push({
                      url: href,
                      text: linkText,
                    });
                  }
                });

              if (dateRegex.test(cellData.text)) {
                let parentText = $(cell).parent().text().trim();
                dateObjects.push({
                  date: cellData.text.match(dateRegex)[0],
                  content: parentText,
                  links: cellData.links,
                });
              }
            });
        });
    });

    let datesWithLinks = dateObjects.filter((obj) => obj.links.length > 0);

    datesWithLinks = Object.values(
      datesWithLinks.reduce((acc, obj) => {
        if (!acc[obj.date]) {
          acc[obj.date] = obj;
        } else {
          acc[obj.date].links.push(...obj.links);
        }
        return acc;
      }, {})
    );

    datesWithLinks.sort((a, b) => {
      const dateOrder =
        new Date(a.date.replace(/(st|nd|rd|th)/g, "")) -
        new Date(b.date.replace(/(st|nd|rd|th)/g, ""));
      return dateOrder;
    });

    return datesWithLinks;
  } catch (error) {
    console.error("Error occurred:", error.message);
  }
}

async function main() {
  const websiteURL = `${process.env.URL}`;
  console.log("Starting scrape of:", websiteURL);
  const events = await scrapeAndSortTable(websiteURL);
  return events;
}

function cleanSequentialReverseDuplicateLinks(events) {
  return events.map((event) => {
    if (!event.links || !Array.isArray(event.links)) return event;

    const seenUrls = new Set();

    const cleanedLinks = [];

    event.links.forEach((link, index, linksArr) => {
      if (!link.url) return;
      if (!link.text) return;

      const fileName = link.url;

      if (seenUrls.has(fileName)) {
        return;
      }

      seenUrls.add(fileName);
      cleanedLinks.push(link);
    });

    return { ...event, links: cleanedLinks };
  });
}

const cleanData = (rawData) => {
  const data = typeof rawData === "string" ? JSON.parse(rawData) : rawData;

  return data.map((dateGroup) => {
    const cleanedLinks = dateGroup.links.map((link) => {
      const cleanText = link.text
        .replace(/\n/g, " ")
        .replace(/\t/g, "")
        .replace(/\s+/g, " ")
        .trim();

      const splitIndex = cleanText.indexOf(" with ");
      let title, description;

      if (splitIndex !== -1) {
        title = cleanText.substring(0, splitIndex).trim();
        description = cleanText.substring(splitIndex + 1).trim();
      } else {
        title = cleanText;
        description = "";
      }

      let cleanUrl = link.url;
      if (!cleanUrl.startsWith("http")) {
        cleanUrl = `${process.env.URL}${cleanUrl}`;
      }

      return {
        title,
        description,
        url: cleanUrl,
      };
    });

    const cleanDate = dateGroup.date
      .replace(/\n/g, " ")
      .replace(/\t/g, "")
      .replace(/\s+/g, " ")
      .trim();

    return {
      date: cleanDate,
      events: cleanedLinks,
    };
  });
};

const processEvents = (rawData) => {
  const data = typeof rawData === "string" ? JSON.parse(rawData) : rawData;

  const processedEvents = [];

  data.forEach((dateEntry) => {
    const date = dateEntry.date.replace(/"/g, "");

    dateEntry.events.forEach((event) => {
      processedEvents.push({
        title: event.title.replace(/"/g, ""),
        description: event.description.replace(/"/g, ""),
        url: event.url.replace(/"/g, ""),
        date: date,
      });
    });
  });

  return processedEvents;
};

const scrape = async () => {
  const events = await main();
  
  const filteredResult = cleanedResult.slice(0, 5).map((event) => ({
    date: event.date,
    links: event.links,
  }));

  const evs = filteredResult.slice(1, 5);

  const evres = cleanData(evs);

  const processEvent = processEvents(evres);

  await postEvents(processEvent);
});

module.exports = scrape;
