// variabler från local storage, för att kunna hämta data från API
const baseURL = "https://cdn.contentful.com/spaces/"; // bas-url för API-anropet
const spaceID = localStorage.getItem("space_id"); // hämtar hemliga informationen från local storage
const accessToken = localStorage.getItem("access_token"); // -||-
const url = `${baseURL}${spaceID}/entries?access_token=${accessToken}&content_type=artist`; // hämtar hela URLen samt artister

const dataContainer = document.getElementById("data-container");

const fetchData = async () => { // asynkron funktion (async), hämtar data från API
    try { // API-anrop, skickar förfrågan
        const response = await fetch(url); // await, väntar på svar innan koden fortsätter

        if (!response.ok) { // kontroll om API-svaret INTE(!) är ok 
            throw new Error("Något gick fel."); // om fel finns hoppar den till catch-koden
        }

        const data = await response.json(); // omvandlar svaret till JSON dvs JavaScript-objekt, await gör att koden väntar till detta är klart

        const artistFullInfo = data.items.map((artist) => { // array med objekt som innehåller all information
            const genreID = artist.fields.genre.sys.id; // IDn för genre, scen och dag
            const stageID = artist.fields.stage.sys.id;
            const dayID = artist.fields.day.sys.id;

            // letar efter samma ID i arrayen från API-svaret som innehåller relationell data
            // om match så sparas informationen i variabeln
            const genre = data.includes.Entry.find(
                (entry) => entry.sys.id === genreID);
            const stage = data.includes.Entry.find(
                (entry) => entry.sys.id === stageID);
            const day = data.includes.Entry.find(
                (entry) => entry.sys.id === dayID);

            // returnerar ett nytt objekt med all information i variabeln
            return {
                name: artist.fields.name,
                dayName: day.fields.description,
                dayDate: new Date(day.fields.date).toLocaleDateString("en-GB",{ // för att få dagen på engelska, och utskriven på sättet jag vill
                    day: "numeric",
                    month: "long"
                }),
                genre: genre.fields.name,
                stage: stage.fields.name,
                stageDescription: stage.fields.description,
                stageArea: stage.fields.area,
                description: artist.fields.description
            };
        });
        
        //Artist HTML---------------------------
        const artistContainer = document.getElementById("artist-container"); // referens till HTML-elementet
        const artistHTML = artistFullInfo.map((artist) => { // HTML-element för varje artist inkl alla delar
            return `<div class="artist-card">
                        <h3>${artist.name}</h3>
                            <div class="artist-info">
                                <p>${artist.dayName}, ${artist.dayDate}</p>
                                <p>${artist.stage}</p>
                                <p>${artist.genre}</p>
                            </div>
                        <p>${artist.description}</p>
                    </div>`;
        }).join(""); // gör en sträng av det hela

        //Stage HTML---------------------------
        const stages= [...new Set(artistFullInfo.map((artist) => artist.stage))]
        .sort(); // skapar lista över scener och sorterar alfabetiskt (sort)
        const stageContainer = document.getElementById("stage-container");
        const stageHTML = stages.map((stageName) => {
            const stageInfo = artistFullInfo.find((artist) => artist.stage === stageName);
            return `<div class="stage-card">
                        <h3>${stageName}</h3>
                            <div class="stage-info">
                                <p class="area">Area ${stageInfo.stageArea}</p>
                                <p>${stageInfo.stageDescription}</p>
                            </div>
                    </div>`;
        }).join("");

        // Program HTML ---------------------------
        const dayProgram = artistFullInfo.reduce((acc, artist) => { // gruppera artister per dag och lagras i objektet dayProgram
        const day = artist.dayName;
        if (!acc[day]) acc[day] = [];
            acc[day].push(artist);
            return acc;
        }, {});

        // sorterar dagarna enligt ordningen jag bestämmer
        const dayOrder = ["Friday", "Saturday", "Sunday"];
        const sortedDays = Object.keys(dayProgram).sort((a, b) => 
            dayOrder.indexOf(a) - dayOrder.indexOf(b));
        
        const programContainer = document.getElementById("program-container");
        const programHTML = sortedDays.map((day) => {
            const artists = dayProgram[day];
            return `<div class="program-card">
                        <h3>${day}</h3>
                        ${artists.map(artist => 
                            `<div class="program-artist">
                                <p><a href="">${artist.name}</a></p>
                            </div>`
                        ).join("")}
                    </div>`; 
        }).join("");

        // sätter HTMLen för varje sektion
        artistContainer.innerHTML = artistHTML;
        stageContainer.innerHTML = stageHTML;
        programContainer.innerHTML = programHTML;


    } catch (error) { // om något går fel under try så fångas felet här
        artistContainer.innerHTML = `<p>Fel vid hämtning av artistinformation.</p>`;
        stageContainer.innerHTML = `<p>Fel vid hämtning av sceninformation.</p>`;
        stageContainer.innerHTML = `<p>Fel vid hämtning av programinformation.</p>`;
    }
};

// anropar funktionen
fetchData();

