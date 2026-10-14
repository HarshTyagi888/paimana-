// ============================================================
// PAIMANA - DYNAMIC PROJECT MONITORING PLATFORM
// ============================================================

const API_BASE_URL =
    "https://50880fyvme.execute-api.ap-south-1.amazonaws.com";

const PREDICT_API = `${API_BASE_URL}/predict`;
const PROJECTS_API = `${API_BASE_URL}/projects`;

const STORAGE_KEY = "paimana_projects_v3";

// ============================================================
// DEFAULT PROJECT DATA
// ============================================================

const DEFAULT_PROJECTS = [
    {
        id: "P001",
        name: "National Highway Development",
        ministry: "Ministry of Road Transport",
        sector: "Transport",
        approvedCost: 12500,
        expenditure: 7850,
        progress: 62,
        status: "Delayed",
        risk: "High",
        costRisk: "High",
        delayRisk: "High",
        fileName: ""
    },

    {
        id: "P002",
        name: "Metro Infrastructure Project",
        ministry: "Ministry of Housing",
        sector: "Transport",
        approvedCost: 8200,
        expenditure: 5100,
        progress: 58,
        status: "Delayed",
        risk: "High",
        costRisk: "High",
        delayRisk: "Medium",
        fileName: ""
    },

    {
        id: "P003",
        name: "River Water Management",
        ministry: "Ministry of Jal Shakti",
        sector: "Water",
        approvedCost: 6400,
        expenditure: 3900,
        progress: 71,
        status: "On Track",
        risk: "Medium",
        costRisk: "Medium",
        delayRisk: "Medium",
        fileName: ""
    },

    {
        id: "P004",
        name: "Solar Energy Expansion",
        ministry: "Ministry of Power",
        sector: "Energy",
        approvedCost: 5800,
        expenditure: 3600,
        progress: 78,
        status: "On Track",
        risk: "Low",
        costRisk: "Low",
        delayRisk: "Low",
        fileName: ""
    },

    {
        id: "P005",
        name: "Railway Modernisation",
        ministry: "Ministry of Railways",
        sector: "Transport",
        approvedCost: 9750,
        expenditure: 6250,
        progress: 69,
        status: "On Track",
        risk: "Medium",
        costRisk: "Medium",
        delayRisk: "Medium",
        fileName: ""
    },

    {
        id: "P006",
        name: "Digital Communication Network",
        ministry: "Ministry of Communications",
        sector: "Communication",
        approvedCost: 4300,
        expenditure: 2900,
        progress: 82,
        status: "On Track",
        risk: "Low",
        costRisk: "Low",
        delayRisk: "Low",
        fileName: ""
    }
];


// ============================================================
// GLOBAL DATA
// ============================================================

let projects = loadProjects();

let charts = {};

let selectedProjectId = null;


// ============================================================
// DOM ELEMENTS
// ============================================================

const sidebar =
    document.getElementById("sidebar");

const menuBtn =
    document.getElementById("menuBtn");

const currentDate =
    document.getElementById("currentDate");

const notificationBtn =
    document.getElementById("notificationBtn");

const toast =
    document.getElementById("toast");

const navItems =
    document.querySelectorAll(".nav-item");

const pages =
    document.querySelectorAll(".page");

const pageTitle =
    document.getElementById("pageTitle");


// ============================================================
// PAGE TITLES
// ============================================================

const pageTitles = {

    dashboard:
        "Project Monitoring Dashboard",

    analytics:
        "Project Analytics",

    risk:
        "Risk & Early Warning System",

    projects:
        "Infrastructure Projects",

    predictions:
        "Project Risk Analysis",

    assistant:
        "Project Intelligence Assistant"

};


// ============================================================
// STORAGE
// ============================================================

function loadProjects() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (saved) {

            const data =
                JSON.parse(saved);

            if (Array.isArray(data)) {

                return data.map(
                    normalizeProject
                );

            }

        }

    }

    catch (error) {

        console.error(
            "Storage load error:",
            error
        );

    }

    return DEFAULT_PROJECTS.map(
        function (project) {

            return {
                ...project
            };

        }
    );

}


function saveProjects() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(projects)
        );

    }

    catch (error) {

        console.error(
            "Storage save error:",
            error
        );

    }

}


// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function money(value) {

    const number =
        Number(value) || 0;

    return (
        "₹" +
        number.toLocaleString(
            "en-IN"
        ) +
        " Cr"
    );

}


function numberValue(value) {

    if (
        typeof value ===
        "number"
    ) {

        return value;

    }

    return (
        Number(
            String(value || "")
                .replace(
                    /[₹,\sA-Za-z]/g,
                    ""
                )
        ) || 0
    );

}


function escapeHTML(value) {

    return String(
        value ?? ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


function generateId() {

    return (
        "P" +
        Date.now()
            .toString()
            .slice(-8)
    );

}


// ============================================================
// DATE
// ============================================================

function setCurrentDate() {

    if (!currentDate) {

        return;

    }

    const now =
        new Date();

    currentDate.textContent =
        now.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

}


// ============================================================
// TOAST
// ============================================================

function showToast(
    message
) {

    if (!toast) {

        return;

    }

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );

    clearTimeout(
        showToast.timer
    );

    showToast.timer =
        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


// ============================================================
// RISK CALCULATION
// ============================================================

function calculateRisk(
    project
) {

    const approved =
        numberValue(
            project.approvedCost
        );

    const expenditure =
        numberValue(
            project.expenditure
        );

    const progress =
        Math.max(
            0,
            Math.min(
                100,
                Number(
                    project.progress
                ) || 0
            )
        );


    const expenditureRatio =
        approved > 0
            ? expenditure / approved
            : 0;


    let score = 0;


    if (
        expenditureRatio > 0.85
    ) {

        score += 45;

    }

    else if (
        expenditureRatio > 0.70
    ) {

        score += 30;

    }

    else if (
        expenditureRatio > 0.55
    ) {

        score += 15;

    }


    if (
        progress < 40
    ) {

        score += 30;

    }

    else if (
        progress < 60
    ) {

        score += 20;

    }

    else if (
        progress < 75
    ) {

        score += 10;

    }


    if (
        project.status ===
        "Delayed"
    ) {

        score += 25;

    }


    let risk =
        "Low";


    if (
        score >= 55
    ) {

        risk =
            "High";

    }

    else if (
        score >= 25
    ) {

        risk =
            "Medium";

    }


    const costRisk =

        expenditureRatio > 0.85
            ? "High"

            :

        expenditureRatio > 0.70
            ? "Medium"

            :

        "Low";


    const delayRisk =

        progress < 40
            ? "High"

            :

        progress < 60
            ? "Medium"

            :

        "Low";


    return {

        risk,
        costRisk,
        delayRisk,
        score

    };

}


// ============================================================
// NORMALIZE PROJECT
// ============================================================

function normalizeProject(
    project
) {

    const p = {

        id:
            project.id ||
            generateId(),

        name:
            project.name ||
            project.project_name ||
            "Unnamed Project",

        ministry:
            project.ministry ||
            "Not specified",

        sector:
            project.sector ||
            "Other",

        approvedCost:
            numberValue(
                project.approvedCost ??
                project.approved_cost
            ),

        expenditure:
            numberValue(
                project.expenditure
            ),

        progress:
            Math.max(
                0,
                Math.min(
                    100,
                    Number(
                        project.progress ??
                        project.physical_progress
                    ) || 0
                )
            ),

        status:
            project.status ||
            "On Track",

        fileName:
            project.fileName ||
            project.file_name ||
            ""

    };


    const calculated =
        calculateRisk(
            p
        );


    p.risk =
        project.risk ||
        calculated.risk;

    p.costRisk =
        project.costRisk ||
        project.cost_risk ||
        calculated.costRisk;

    p.delayRisk =
        project.delayRisk ||
        project.delay_risk ||
        calculated.delayRisk;


    return p;

}


// ============================================================
// MOBILE SIDEBAR
// ============================================================

if (menuBtn) {

    menuBtn.addEventListener(
        "click",
        function () {

            if (sidebar) {

                sidebar.classList.toggle(
                    "open"
                );

            }

        }
    );

}


// ============================================================
// PAGE NAVIGATION
// ============================================================

function showPage(
    pageName
) {

    pages.forEach(
        function (page) {

            page.classList.remove(
                "active-page"
            );

        }
    );


    const selected =
        document.getElementById(
            pageName
        );


    if (selected) {

        selected.classList.add(
            "active-page"
        );

    }


    navItems.forEach(
        function (item) {

            item.classList.toggle(
                "active",
                item.dataset.page ===
                    pageName
            );

        }
    );


    if (
        pageTitle &&
        pageTitles[pageName]
    ) {

        pageTitle.textContent =
            pageTitles[pageName];

    }


    if (sidebar) {

        sidebar.classList.remove(
            "open"
        );

    }


    setTimeout(
        function () {

            Object.values(
                charts
            ).forEach(
                function (chart) {

                    try {

                        chart?.resize();

                    }

                    catch (_) {}

                }
            );

        },
        100
    );

}


navItems.forEach(
    function (item) {

        item.addEventListener(
            "click",
            function () {

                showPage(
                    item.dataset.page
                );

            }
        );

    }
);


// ============================================================
// CREATE ADD PROJECT MODAL
// ============================================================

function createAddProjectModal() {

    if (
        document.getElementById(
            "dynamicProjectFormModal"
        )
    ) {

        return;

    }


    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.id =
        "dynamicProjectFormModal";


    wrapper.className =
        "modal";


    wrapper.innerHTML = `

        <div
            class="modal-content"
            style="max-width:720px;"
        >

            <button
                class="modal-close"
                type="button"
                id="dynamicProjectClose"
            >
                ×
            </button>


            <h2>
                Add New Infrastructure Project
            </h2>


            <form
                id="dynamicProjectForm"
            >

                <div
                    class="modal-grid"
                >

                    <div>

                        <span>
                            Project Name
                        </span>

                        <input
                            id="newProjectName"
                            required
                            placeholder="Enter project name"
                            style="width:100%;padding:10px;margin-top:6px;"
                        >

                    </div>


                    <div>

                        <span>
                            Ministry
                        </span>

                        <input
                            id="newProjectMinistry"
                            required
                            placeholder="Enter ministry"
                            style="width:100%;padding:10px;margin-top:6px;"
                        >

                    </div>


                    <div>

                        <span>
                            Sector
                        </span>

                        <select
                            id="newProjectSector"
                            style="width:100%;padding:10px;margin-top:6px;"
                        >

                            <option>
                                Transport
                            </option>

                            <option>
                                Energy
                            </option>

                            <option>
                                Water
                            </option>

                            <option>
                                Communication
                            </option>

                            <option>
                                Other
                            </option>

                        </select>

                    </div>


                    <div>

                        <span>
                            Status
                        </span>

                        <select
                            id="newProjectStatus"
                            style="width:100%;padding:10px;margin-top:6px;"
                        >

                            <option>
                                On Track
                            </option>

                            <option>
                                Delayed
                            </option>

                            <option>
                                Completed
                            </option>

                        </select>

                    </div>


                    <div>

                        <span>
                            Approved Cost (₹ Cr)
                        </span>

                        <input
                            id="newProjectCost"
                            type="number"
                            min="0"
                            required
                            placeholder="12500"
                            style="width:100%;padding:10px;margin-top:6px;"
                        >

                    </div>


                    <div>

                        <span>
                            Expenditure (₹ Cr)
                        </span>

                        <input
                            id="newProjectExpenditure"
                            type="number"
                            min="0"
                            required
                            placeholder="7850"
                            style="width:100%;padding:10px;margin-top:6px;"
                        >

                    </div>


                    <div>

                        <span>
                            Physical Progress (%)
                        </span>

                        <input
                            id="newProjectProgress"
                            type="number"
                            min="0"
                            max="100"
                            required
                            placeholder="62"
                            style="width:100%;padding:10px;margin-top:6px;"
                        >

                    </div>


                    <div>

                        <span>
                            Project File
                        </span>

                        <input
                            id="newProjectFile"
                            type="file"
                            accept=".pdf,.csv,.xlsx,.xls,.doc,.docx,.txt"
                            style="width:100%;padding:10px;margin-top:6px;"
                        >

                    </div>

                </div>


                <div
                    id="selectedFileInfo"
                    style="margin-top:12px;font-size:13px;"
                ></div>


                <div
                    style="display:flex;gap:10px;margin-top:20px;"
                >

                    <button
                        class="primary-btn"
                        type="submit"
                    >
                        Add Project
                    </button>


                    <button
                        class="text-btn"
                        type="button"
                        id="dynamicProjectCancel"
                    >
                        Cancel
                    </button>

                </div>


                <p
                    id="projectFormStatus"
                    style="margin-top:10px;"
                ></p>

            </form>

        </div>

    `;


    document.body.appendChild(
        wrapper
    );


    const close =
        function () {

            wrapper.classList.remove(
                "show"
            );

        };


    document.getElementById(
        "dynamicProjectClose"
    ).onclick =
        close;


    document.getElementById(
        "dynamicProjectCancel"
    ).onclick =
        close;


    wrapper.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                wrapper
            ) {

                close();

            }

        }
    );


    document.getElementById(
        "newProjectFile"
    ).addEventListener(
        "change",
        function (event) {

            const file =
                event.target.files?.[0];

            const info =
                document.getElementById(
                    "selectedFileInfo"
                );


            if (!file) {

                info.textContent =
                    "";

                return;

            }


            info.textContent =
                "Selected: " +
                file.name +
                " · " +
                (
                    file.size / 1024
                ).toFixed(1) +
                " KB";

        }
    );


    document.getElementById(
        "dynamicProjectForm"
    ).addEventListener(
        "submit",
        addProjectFromForm
    );

}


// ============================================================
// OPEN ADD PROJECT FORM
// ============================================================

function openAddProjectForm() {

    createAddProjectModal();


    const modal =
        document.getElementById(
            "dynamicProjectFormModal"
        );


    const form =
        document.getElementById(
            "dynamicProjectForm"
        );


    form.reset();


    document.getElementById(
        "selectedFileInfo"
    ).textContent =
        "";


    document.getElementById(
        "projectFormStatus"
    ).textContent =
        "";


    modal.classList.add(
        "show"
    );

}


// ============================================================
// ADD PROJECT
// ============================================================

async function addProjectFromForm(
    event
) {

    event.preventDefault();


    const file =
        document.getElementById(
            "newProjectFile"
        ).files?.[0];


    const project =
        normalizeProject({

            name:
                document.getElementById(
                    "newProjectName"
                ).value.trim(),

            ministry:
                document.getElementById(
                    "newProjectMinistry"
                ).value.trim(),

            sector:
                document.getElementById(
                    "newProjectSector"
                ).value,

            status:
                document.getElementById(
                    "newProjectStatus"
                ).value,

            approvedCost:
                document.getElementById(
                    "newProjectCost"
                ).value,

            expenditure:
                document.getElementById(
                    "newProjectExpenditure"
                ).value,

            progress:
                document.getElementById(
                    "newProjectProgress"
                ).value,

            fileName:
                file
                    ? file.name
                    : ""

        });


    if (
        !project.name ||
        !project.ministry
    ) {

        showToast(
            "Please fill all required fields"
        );

        return;

    }


    const status =
        document.getElementById(
            "projectFormStatus"
        );


    status.textContent =
        "Saving project...";


    let apiSaved =
        false;


    // ========================================================
    // SAVE TO AWS API
    // ========================================================

    try {

        const response =
            await fetch(
                PROJECTS_API,
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            id:
                                project.id,

                            project_name:
                                project.name,

                            name:
                                project.name,

                            ministry:
                                project.ministry,

                            sector:
                                project.sector,

                            approved_cost:
                                project.approvedCost,

                            expenditure:
                                project.expenditure,

                            physical_progress:
                                project.progress,

                            status:
                                project.status,

                            risk:
                                project.risk,

                            cost_risk:
                                project.costRisk,

                            delay_risk:
                                project.delayRisk,

                            file_name:
                                project.fileName

                        })

                }
            );


        if (
            response.ok
        ) {

            apiSaved =
                true;

        }

        else {

            console.warn(
                "POST /projects failed:",
                response.status
            );

        }

    }

    catch (error) {

        console.warn(
            "Projects API unavailable:",
            error
        );

    }


    // ========================================================
    // LOCAL STORAGE FALLBACK
    // ========================================================

    projects.unshift(
        project
    );


    saveProjects();


    document.getElementById(
        "dynamicProjectFormModal"
    ).classList.remove(
        "show"
    );


    renderAllDynamicData();


    showPage(
        "projects"
    );


    showToast(

        apiSaved

            ? "Project added successfully"

            : "Project added locally"

    );

}


// ============================================================
// ATTACH ADD PROJECT BUTTON
// ============================================================

function attachAddProjectButton() {

    const buttons =
        document.querySelectorAll(
            "#projects .page-heading .primary-btn"
        );


    buttons.forEach(
        function (button) {

            button.type =
                "button";


            button.onclick =
                openAddProjectForm;

        }
    );

}


// ============================================================
// RENDER PROJECT TABLE
// ============================================================

function renderProjectTable(
    data = projects
) {

    const table =
        document.getElementById(
            "projectTable"
        );


    if (!table) {

        return;

    }


    if (!data.length) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    style="text-align:center;padding:30px;"
                >

                    No projects available.

                </td>

            </tr>

        `;

        return;

    }


    table.innerHTML =
        data.map(
            function (project) {

                return `

                    <tr>

                        <td>
                            ${escapeHTML(
                                project.name
                            )}
                        </td>


                        <td>
                            ${escapeHTML(
                                project.ministry
                            )}
                        </td>


                        <td>
                            ${escapeHTML(
                                project.sector
                            )}
                        </td>


                        <td>
                            ${money(
                                project.approvedCost
                            )}
                        </td>


                        <td>
                            ${money(
                                project.expenditure
                            )}
                        </td>


                        <td>

                            <div
                                class="progress-bar"
                            >

                                <div
                                    style="width:${project.progress}%"
                                ></div>

                            </div>

                            ${project.progress}%

                        </td>


                        <td>

                            <span
                                class="risk-badge ${project.risk.toLowerCase()}"
                            >

                                ${escapeHTML(
                                    project.risk
                                )}

                            </span>

                        </td>


                        <td>

                            <button
                                class="text-btn"
                                onclick="openProjectModalById('${project.id}')"
                            >
                                View
                            </button>


                            <button
                                class="text-btn"
                                onclick="editProject('${project.id}')"
                            >
                                Edit
                            </button>


                            <button
                                class="text-btn"
                                onclick="deleteProject('${project.id}')"
                            >
                                Delete
                            </button>


                            ${
                                project.fileName
                                    ? `<small title="${escapeHTML(project.fileName)}">📎</small>`
                                    : ""
                            }

                        </td>

                    </tr>

                `;

            }
        ).join("");

}


// ============================================================
// HIGH RISK TABLE
// ============================================================

function renderRiskProjectTable() {

    const table =
        document.getElementById(
            "riskProjectTable"
        );


    if (!table) {

        return;

    }


    const highRisk =
        projects.filter(
            function (project) {

                return (
                    project.risk ===
                    "High"
                );

            }
        );


    table.innerHTML =
        highRisk.map(
            function (project) {

                return `

                    <tr>

                        <td>
                            ${escapeHTML(
                                project.name
                            )}
                        </td>


                        <td>
                            ${escapeHTML(
                                project.ministry
                            )}
                        </td>


                        <td>
                            ${escapeHTML(
                                project.sector
                            )}
                        </td>


                        <td>

                            <span
                                class="risk-badge ${project.costRisk.toLowerCase()}"
                            >
                                ${project.costRisk}
                            </span>

                        </td>


                        <td>

                            <span
                                class="risk-badge ${project.delayRisk.toLowerCase()}"
                            >
                                ${project.delayRisk}
                            </span>

                        </td>


                        <td>

                            <span
                                class="risk-badge high"
                            >
                                ${project.risk}
                            </span>

                        </td>


                        <td>

                            <span
                                class="status high"
                            >
                                ${escapeHTML(
                                    project.status
                                )}
                            </span>

                        </td>

                    </tr>

                `;

            }
        ).join("");

}


// ============================================================
// SEARCH
// ============================================================

function searchProjects() {

    const input =
        document.getElementById(
            "projectSearch"
        );


    if (!input) {

        return;

    }


    const search =
        input.value
            .toLowerCase()
            .trim();


    const filtered =

        !search

            ? projects

            :

        projects.filter(
            function (project) {

                return [

                    project.name,

                    project.ministry,

                    project.sector,

                    project.status,

                    project.risk

                ].some(
                    function (value) {

                        return String(
                            value
                        )
                            .toLowerCase()
                            .includes(
                                search
                            );

                    }
                );

            }
        );


    renderProjectTable(
        filtered
    );

}


const projectSearch =
    document.getElementById(
        "projectSearch"
    );


if (projectSearch) {

    projectSearch.addEventListener(
        "input",
        searchProjects
    );

}


// ============================================================
// EDIT PROJECT
// ============================================================

function editProject(
    id
) {

    const project =
        projects.find(
            function (p) {

                return p.id === id;

            }
        );


    if (!project) {

        return;

    }


    createAddProjectModal();


    const modal =
        document.getElementById(
            "dynamicProjectFormModal"
        );


    modal.classList.add(
        "show"
    );


    document.getElementById(
        "newProjectName"
    ).value =
        project.name;


    document.getElementById(
        "newProjectMinistry"
    ).value =
        project.ministry;


    document.getElementById(
        "newProjectSector"
    ).value =
        project.sector;


    document.getElementById(
        "newProjectStatus"
    ).value =
        project.status;


    document.getElementById(
        "newProjectCost"
    ).value =
        project.approvedCost;


    document.getElementById(
        "newProjectExpenditure"
    ).value =
        project.expenditure;


    document.getElementById(
        "newProjectProgress"
    ).value =
        project.progress;


    document.getElementById(
        "projectFormStatus"
    ).textContent =
        "Editing project";


    const form =
        document.getElementById(
            "dynamicProjectForm"
        );


    form.onsubmit =
        function (event) {

            event.preventDefault();


            project.name =
                document.getElementById(
                    "newProjectName"
                ).value.trim();


            project.ministry =
                document.getElementById(
                    "newProjectMinistry"
                ).value.trim();


            project.sector =
                document.getElementById(
                    "newProjectSector"
                ).value;


            project.status =
                document.getElementById(
                    "newProjectStatus"
                ).value;


            project.approvedCost =
                numberValue(
                    document.getElementById(
                        "newProjectCost"
                    ).value
                );


            project.expenditure =
                numberValue(
                    document.getElementById(
                        "newProjectExpenditure"
                    ).value
                );


            project.progress =
                Number(
                    document.getElementById(
                        "newProjectProgress"
                    ).value
                ) || 0;


            const calculated =
                calculateRisk(
                    project
                );


            project.risk =
                calculated.risk;


            project.costRisk =
                calculated.costRisk;


            project.delayRisk =
                calculated.delayRisk;


            const file =
                document.getElementById(
                    "newProjectFile"
                ).files?.[0];


            if (file) {

                project.fileName =
                    file.name;

            }


            saveProjects();


            modal.classList.remove(
                "show"
            );


            renderAllDynamicData();


            showToast(
                "Project updated successfully"
            );


            form.onsubmit =
                null;

        };

}


// ============================================================
// DELETE PROJECT
// ============================================================

async function deleteProject(
    id
) {

    const project =
        projects.find(
            function (p) {

                return p.id === id;

            }
        );


    if (!project) {

        return;

    }


    const confirmed =
        confirm(
            `Delete "${project.name}"?`
        );


    if (!confirmed) {

        return;

    }


    try {

        await fetch(
            `${PROJECTS_API}/${encodeURIComponent(id)}`,
            {

                method:
                    "DELETE"

            }
        );

    }

    catch (error) {

        console.warn(
            "DELETE API unavailable:",
            error
        );

    }


    projects =
        projects.filter(
            function (p) {

                return p.id !== id;

            }
        );


    saveProjects();


    renderAllDynamicData();


    showToast(
        "Project deleted"
    );

}


// ============================================================
// RISK ALERTS
// ============================================================

function renderRiskAlerts(
    filter = "all"
) {

    const container =
        document.getElementById(
            "riskAlertContainer"
        );


    if (!container) {

        return;

    }


    const filtered =

        filter === "all"

            ? projects

            :

        projects.filter(
            function (project) {

                return (
                    project.risk
                        .toLowerCase() ===
                    filter
                );

            }
        );


    if (!filtered.length) {

        container.innerHTML = `

            <div
                class="panel"
                style="padding:20px;"
            >

                No projects found.

            </div>

        `;

        return;

    }


    container.innerHTML =
        filtered.map(
            function (project) {

                const level =
                    project.risk
                        .toLowerCase();


                let message =
                    "Project is currently within normal monitoring levels.";


                if (
                    level ===
                    "high"
                ) {

                    message =
                        "High risk detected from project cost, progress and schedule indicators. Immediate monitoring is recommended.";

                }


                else if (
                    level ===
                    "medium"
                ) {

                    message =
                        "Moderate risk indicators detected. Increased monitoring is recommended.";

                }


                return `

                    <div
                        class="risk-alert ${level}"
                    >

                        <h3>
                            ${escapeHTML(
                                project.name
                            )}
                        </h3>


                        <p>

                            <strong>
                                ${escapeHTML(
                                    project.risk
                                )}
                                Risk
                            </strong>

                            ·

                            ${escapeHTML(
                                project.sector
                            )}

                            ·

                            ${escapeHTML(
                                project.ministry
                            )}

                        </p>


                        <p>
                            ${message}
                        </p>

                    </div>

                `;

            }
        ).join("");

}


function filterRisks() {

    const filter =
        document.getElementById(
            "riskFilter"
        );


    renderRiskAlerts(
        filter
            ? filter.value
            : "all"
    );

}


// ============================================================
// PROJECT MODAL
// ============================================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;

    }

}


function openProjectModalById(
    id
) {

    selectedProjectId =
        id;


    const project =
        projects.find(
            function (p) {

                return p.id === id;

            }
        );


    if (!project) {

        return;

    }


    setText(
        "modalProjectName",
        project.name
    );


    setText(
        "modalMinistry",
        project.ministry
    );


    setText(
        "modalSector",
        project.sector
    );


    setText(
        "modalCost",
        money(
            project.approvedCost
        )
    );


    setText(
        "modalExpenditure",
        money(
            project.expenditure
        )
    );


    setText(
        "modalProgress",
        project.progress +
        "%"
    );


    setText(
        "modalRisk",
        project.risk
    );


    setText(
        "modalAnalysis",
        generateAnalysis(
            project
        )
    );


    const modal =
        document.getElementById(
            "projectModal"
        );


    if (modal) {

        modal.classList.add(
            "show"
        );

    }

}


function openProjectModal(
    index
) {

    const project =
        projects[index];


    if (project) {

        openProjectModalById(
            project.id
        );

    }

}


function closeModal() {

    const modal =
        document.getElementById(
            "projectModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }

}


function generateAnalysis(
    project
) {

    if (
        project.risk ===
        "High"
    ) {

        return (
            "Project requires immediate monitoring. " +
            "Elevated cost and schedule risk indicators " +
            "have been detected."
        );

    }


    if (
        project.risk ===
        "Medium"
    ) {

        return (
            "Project is progressing with moderate risk. " +
            "Continue regular monitoring of expenditure, " +
            "milestones and physical progress."
        );

    }


    return (
        "Project is currently at low risk. " +
        "Progress and expenditure indicators are " +
        "within acceptable monitoring levels."
    );

}


const projectModal =
    document.getElementById(
        "projectModal"
    );


if (projectModal) {

    projectModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                projectModal
            ) {

                closeModal();

            }

        }
    );

}


// ============================================================
// DASHBOARD STATISTICS
// ============================================================

function updateDashboardStats() {

    const cards =
        document.querySelectorAll(
            "#dashboard .stat-card h3"
        );


    if (!cards.length) {

        return;

    }


    const total =
        projects.length;


    const originalCost =
        projects.reduce(
            function (
                sum,
                project
            ) {

                return (
                    sum +
                    numberValue(
                        project.approvedCost
                    )
                );

            },
            0
        );


    const expenditure =
        projects.reduce(
            function (
                sum,
                project
            ) {

                return (
                    sum +
                    numberValue(
                        project.expenditure
                    )
                );

            },
            0
        );


    if (cards[0]) {

        cards[0].textContent =
            total.toLocaleString(
                "en-IN"
            );

    }


    if (cards[1]) {

        cards[1].textContent =
            money(
                originalCost
            );

    }


    if (cards[3]) {

        cards[3].textContent =
            money(
                expenditure
            );

    }

}


// ============================================================
// CHARTS
// ============================================================

function destroyChart(
    name
) {

    if (charts[name]) {

        charts[name].destroy();

        charts[name] =
            null;

    }

}


// ============================================================
// RISK CHART
// ============================================================

function createRiskChart() {

    const canvas =
        document.getElementById(
            "riskChart"
        );


    if (
        !canvas ||
        !window.Chart
    ) {

        return;

    }


    destroyChart(
        "risk"
    );


    charts.risk =
        new Chart(
            canvas,
            {

                type:
                    "doughnut",

                data: {

                    labels: [

                        "High Risk",

                        "Medium Risk",

                        "Low Risk"

                    ],

                    datasets: [

                        {

                            data: [

                                projects.filter(
                                    p =>
                                        p.risk ===
                                        "High"
                                ).length,

                                projects.filter(
                                    p =>
                                        p.risk ===
                                        "Medium"
                                ).length,

                                projects.filter(
                                    p =>
                                        p.risk ===
                                        "Low"
                                ).length

                            ]

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {

                            position:
                                "bottom"

                        }

                    }

                }

            }
        );

}


// ============================================================
// SECTOR CHART
// ============================================================

function createSectorChart() {

    const canvas =
        document.getElementById(
            "sectorChart"
        );


    if (
        !canvas ||
        !window.Chart
    ) {

        return;

    }


    destroyChart(
        "sector"
    );


    const sectors =
        [
            ...new Set(
                projects.map(
                    p =>
                        p.sector
                )
            )
        ];


    charts.sector =
        new Chart(
            canvas,
            {

                type:
                    "bar",

                data: {

                    labels:
                        sectors,

                    datasets: [

                        {

                            label:
                                "Projects",

                            data:
                                sectors.map(
                                    function (
                                        sector
                                    ) {

                                        return projects.filter(
                                            p =>
                                                p.sector ===
                                                sector
                                        ).length;

                                    }
                                )

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    plugins: {

                        legend: {

                            display:
                                false

                        }

                    }

                }

            }
        );

}


// ============================================================
// COST CHART
// ============================================================

function createCostChart() {

    const canvas =
        document.getElementById(
            "costChart"
        );


    if (
        !canvas ||
        !window.Chart
    ) {

        return;

    }


    destroyChart(
        "cost"
    );


    const sectors =
        [
            ...new Set(
                projects.map(
                    p =>
                        p.sector
                )
            )
        ];


    charts.cost =
        new Chart(
            canvas,
            {

                type:
                    "bar",

                data: {

                    labels:
                        sectors,

                    datasets: [

                        {

                            label:
                                "Approved Cost",

                            data:
                                sectors.map(
                                    function (
                                        sector
                                    ) {

                                        return projects
                                            .filter(
                                                p =>
                                                    p.sector ===
                                                    sector
                                            )
                                            .reduce(
                                                function (
                                                    sum,
                                                    p
                                                ) {

                                                    return (
                                                        sum +
                                                        p.approvedCost
                                                    );

                                                },
                                                0
                                            );

                                    }
                                )

                        },


                        {

                            label:
                                "Expenditure",

                            data:
                                sectors.map(
                                    function (
                                        sector
                                    ) {

                                        return projects
                                            .filter(
                                                p =>
                                                    p.sector ===
                                                    sector
                                            )
                                            .reduce(
                                                function (
                                                    sum,
                                                    p
                                                ) {

                                                    return (
                                                        sum +
                                                        p.expenditure
                                                    );

                                                },
                                                0
                                            );

                                    }
                                )

                        }

                    ]

                },

                options: {

                    responsive:
                        true

                }

            }
        );

}


// ============================================================
// PROGRESS CHART
// ============================================================

function createProgressChart() {

    const canvas =
        document.getElementById(
            "progressChart"
        );


    if (
        !canvas ||
        !window.Chart
    ) {

        return;

    }


    destroyChart(
        "progress"
    );


    const sectors =
        [
            ...new Set(
                projects.map(
                    p =>
                        p.sector
                )
            )
        ];


    charts.progress =
        new Chart(
            canvas,
            {

                type:
                    "bar",

                data: {

                    labels:
                        sectors,

                    datasets: [

                        {

                            label:
                                "Actual Progress",

                            data:
                                sectors.map(
                                    function (
                                        sector
                                    ) {

                                        const list =
                                            projects.filter(
                                                p =>
                                                    p.sector ===
                                                    sector
                                            );


                                        if (
                                            !list.length
                                        ) {

                                            return 0;

                                        }


                                        return (
                                            list.reduce(
                                                function (
                                                    sum,
                                                    p
                                                ) {

                                                    return (
                                                        sum +
                                                        p.progress
                                                    );

                                                },
                                                0
                                            ) /
                                            list.length
                                        );

                                    }
                                )

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    scales: {

                        y: {

                            beginAtZero:
                                true,

                            max:
                                100

                        }

                    }

                }

            }
        );

}


// ============================================================
// MONTHLY CHART
// ============================================================

function createMonthlyChart() {

    const canvas =
        document.getElementById(
            "monthlyChart"
        );


    if (
        !canvas ||
        !window.Chart
    ) {

        return;

    }


    destroyChart(
        "monthly"
    );


    const averageProgress =
        projects.length

            ?

        projects.reduce(
            function (
                sum,
                project
            ) {

                return (
                    sum +
                    project.progress
                );

            },
            0
        ) /
        projects.length

            :

        0;


    charts.monthly =
        new Chart(
            canvas,
            {

                type:
                    "line",

                data: {

                    labels: [

                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug"

                    ],

                    datasets: [

                        {

                            label:
                                "Average Progress",

                            data: [

                                averageProgress * 0.72,

                                averageProgress * 0.76,

                                averageProgress * 0.79,

                                averageProgress * 0.83,

                                averageProgress * 0.87,

                                averageProgress * 0.91,

                                averageProgress * 0.96,

                                averageProgress

                            ],

                            tension:
                                0.3

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    scales: {

                        y: {

                            beginAtZero:
                                true,

                            max:
                                100

                        }

                    }

                }

            }
        );

}


// ============================================================
// REFRESH EVERYTHING
// ============================================================

function renderAllDynamicData() {

    projects =
        projects.map(
            normalizeProject
        );


    saveProjects();


    renderProjectTable();


    renderRiskProjectTable();


    renderRiskAlerts(
        "all"
    );


    updateDashboardStats();


    createRiskChart();


    createSectorChart();


    createCostChart();


    createProgressChart();


    createMonthlyChart();


    attachAddProjectButton();

}


// ============================================================
// REFRESH BUTTON
// ============================================================

function refreshDashboard() {

    renderAllDynamicData();

    showToast(
        "Dashboard data refreshed"
    );

}


// ============================================================
// API - PREDICTION
// ============================================================

async function predictProject(
    projectData
) {

    console.log(
        "Sending project data:",
        projectData
    );


    const response =
        await fetch(
            PREDICT_API,
            {

                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify(
                        projectData
                    )

            }
        );


    const responseText =
        await response.text();


    let data;


    try {

        data =
            responseText
                ? JSON.parse(
                    responseText
                )
                : {};

    }

    catch (error) {

        throw new Error(
            "API returned non-JSON response"
        );

    }


    if (
        !response.ok
    ) {

        throw new Error(

            data.error ||

            data.message ||

            `HTTP ${response.status}`

        );

    }


    if (
        data.body &&
        typeof data.body ===
            "string"
    ) {

        try {

            data =
                JSON.parse(
                    data.body
                );

        }

        catch (_) {}

    }


    return data;

}


// ============================================================
// RUN PREDICTION
// ============================================================

async function runPrediction(
    project
) {

    try {

        showToast(
            "Analysing project..."
        );


        const result =
            await predictProject({

                project_name:
                    project.name,

                ministry:
                    project.ministry,

                sector:
                    project.sector,

                approved_cost:
                    project.approvedCost,

                expenditure:
                    project.expenditure,

                physical_progress:
                    project.progress

            });


        updatePredictionCards(
            result
        );


        showToast(
            "Project analysis completed"
        );


        return result;

    }

    catch (error) {

        console.error(
            "Prediction error:",
            error
        );


        showToast(
            "Analysis failed: " +
            error.message
        );


        return null;

    }

}


// ============================================================
// UPDATE PREDICTION CARDS
// ============================================================

function updatePredictionCards(
    result
) {

    if (!result) {

        return;

    }


    const cards =
        document.querySelectorAll(
            "#predictions .prediction-card"
        );


    if (!cards.length) {

        return;

    }


    if (
        result.cost_overrun_probability !==
        undefined
    ) {

        const h =
            cards[0]
                .querySelector(
                    "h1"
                );


        if (h) {

            h.textContent =
                result.cost_overrun_probability +
                "%";

        }

    }


    if (
        result.delay_probability !==
        undefined
    ) {

        const h =
            cards[1]
                .querySelector(
                    "h1"
                );


        if (h) {

            h.textContent =
                result.delay_probability +
                "%";

        }

    }


    if (
        result.risk_score !==
        undefined
    ) {

        const h =
            cards[2]
                .querySelector(
                    "h1"
                );


        if (h) {

            h.textContent =
                result.risk_score;

        }

    }

}


// ============================================================
// AI ASSISTANT
// ============================================================

const chatArea =
    document.getElementById(
        "chatArea"
    );


const chatInput =
    document.getElementById(
        "chatInput"
    );


const sendBtn =
    document.getElementById(
        "sendBtn"
    );


function addChatMessage(
    message,
    user = false
) {

    if (!chatArea) {

        return;

    }


    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        user
            ? "chat-message user"
            : "chat-message bot";


    const avatar =
        user
            ? ""

            :

        '<div class="chat-avatar">🤖</div>';


    wrapper.innerHTML = `

        ${avatar}

        <div class="message">

            <strong>
                ${user ? "You" : "PAIMANA"}
            </strong>

            <p></p>

        </div>

    `;


    wrapper
        .querySelector(
            "p"
        )
        .textContent =
        message;


    chatArea.appendChild(
        wrapper
    );


    chatArea.scrollTop =
        chatArea.scrollHeight;

}


// ============================================================
// ASSISTANT RESPONSE
// ============================================================

function getAssistantResponse(
    question
) {

    const q =
        question.toLowerCase();


    if (
        q.includes("high risk") ||
        q.includes("high-risk")
    ) {

        const high =
            projects.filter(
                function (project) {

                    return (
                        project.risk ===
                        "High"
                    );

                }
            );


        if (!high.length) {

            return (
                "There are currently no high-risk projects."
            );

        }


        return (

            "High-risk projects: " +

            high.map(
                function (project) {

                    return project.name;

                }
            ).join(
                ", "
            ) +

            "."

        );

    }


    if (
        q.includes("delay") ||
        q.includes("schedule")
    ) {

        const delayed =
            projects.filter(
                function (project) {

                    return (

                        project.status ===
                        "Delayed"

                        ||

                        project.delayRisk ===
                        "High"

                    );

                }
            );


        if (!delayed.length) {

            return (
                "No projects currently show major delay risk."
            );

        }


        return (

            "Projects requiring delay monitoring: " +

            delayed.map(
                function (project) {

                    return project.name;

                }
            ).join(
                ", "
            ) +

            "."

        );

    }


    if (
        q.includes("cost") ||
        q.includes("overrun")
    ) {

        const risky =
            projects.filter(
                function (project) {

                    return (
                        project.costRisk ===
                        "High"
                    );

                }
            );


        if (!risky.length) {

            return (
                "No projects currently have high cost risk."
            );

        }


        return (

            "High cost-risk projects: " +

            risky.map(
                function (project) {

                    return project.name;

                }
            ).join(
                ", "
            ) +

            "."

        );

    }


    if (
        q.includes("sector")
    ) {

        const sectors =
            [
                ...new Set(
                    projects.map(
                        p =>
                            p.sector
                    )
                )
            ];


        if (!sectors.length) {

            return (
                "No sector data is available."
            );

        }


        let largest =
            sectors[0];


        let largestCount =
            0;


        sectors.forEach(
            function (sector) {

                const count =
                    projects.filter(
                        p =>
                            p.sector ===
                            sector
                    ).length;


                if (
                    count >
                    largestCount
                ) {

                    largest =
                        sector;

                    largestCount =
                        count;

                }

            }
        );


        return (

            largest +

            " currently has the largest number of projects (" +

            largestCount +

            ")."

        );

    }


    if (
        q.includes("project")
    ) {

        return (

            "PAIMANA currently contains " +

            projects.length +

            " projects."

        );

    }


    return (

        "I can help with high-risk projects, " +

        "delays, cost overruns, sectors and " +

        "project performance."

    );

}


// ============================================================
// SEND MESSAGE
// ============================================================

function sendMessage() {

    if (!chatInput) {

        return;

    }


    const message =
        chatInput.value.trim();


    if (!message) {

        return;

    }


    addChatMessage(
        message,
        true
    );


    chatInput.value =
        "";


    setTimeout(
        function () {

            const response =
                getAssistantResponse(
                    message
                );


            addChatMessage(
                response,
                false
            );

        },
        300
    );

}


if (sendBtn) {

    sendBtn.addEventListener(
        "click",
        sendMessage
    );

}


if (chatInput) {

    chatInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                sendMessage();

            }

        }
    );

}


// ============================================================
// SUGGESTIONS
// ============================================================

function askSuggestion(
    question
) {

    if (!chatInput) {

        return;

    }


    chatInput.value =
        question;


    sendMessage();

}


// ============================================================
// LOAD PROJECTS FROM AWS
// ============================================================

async function loadProjectsFromAPI() {

    try {

        const response =
            await fetch(
                PROJECTS_API,
                {

                    method:
                        "GET"

                }
            );


        if (
            !response.ok
        ) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const text =
            await response.text();


        if (!text) {

            return;

        }


        let data =
            JSON.parse(
                text
            );


        if (
            data.body &&
            typeof data.body ===
                "string"
        ) {

            try {

                data =
                    JSON.parse(
                        data.body
                    );

            }

            catch (_) {}

        }


        const remote =

            Array.isArray(
                data
            )

                ? data

                :

            Array.isArray(
                data.projects
            )

                ? data.projects

                :

            Array.isArray(
                data.Items
            )

                ? data.Items

                :

            [];


        if (
            remote.length
        ) {

            projects =
                remote.map(
                    normalizeProject
                );


            saveProjects();


            renderAllDynamicData();


            showToast(
                "Projects loaded from AWS"
            );

        }

    }

    catch (error) {

        console.warn(
            "GET /projects unavailable. Local data retained.",
            error
        );

    }

}


// ============================================================
// TEST API
// ============================================================

async function testAPI() {

    const testProject = {

        project_name:
            "PAIMANA Test Project",

        ministry:
            "Test Ministry",

        sector:
            "Transport",

        approved_cost:
            1000,

        expenditure:
            600,

        physical_progress:
            60

    };


    try {

        const result =
            await predictProject(
                testProject
            );


        console.log(
            "API SUCCESS:",
            result
        );


        showToast(
            "API connection successful"
        );


        return result;

    }

    catch (error) {

        console.error(
            "API FAILED:",
            error
        );


        showToast(
            "API connection failed"
        );


        return null;

    }

}


// ============================================================
// NOTIFICATIONS
// ============================================================

if (notificationBtn) {

    notificationBtn.addEventListener(
        "click",
        function () {

            showPage(
                "risk"
            );


            showToast(
                "Showing current risk alerts"
            );

        }
    );

}


// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setCurrentDate();


        createAddProjectModal();


        renderAllDynamicData();


        loadProjectsFromAPI();


        console.log(
            "======================================"
        );


        console.log(
            "PAIMANA DYNAMIC FRONTEND LOADED"
        );


        console.log(
            "Projects:",
            projects.length
        );


        console.log(
            "Projects API:",
            PROJECTS_API
        );


        console.log(
            "Prediction API:",
            PREDICT_API
        );


        console.log(
            "======================================"
        );

    }
);


// ============================================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// ============================================================

window.showPage =
    showPage;

window.refreshDashboard =
    refreshDashboard;

window.searchProjects =
    searchProjects;

window.filterRisks =
    filterRisks;

window.openProjectModal =
    openProjectModal;

window.openProjectModalById =
    openProjectModalById;

window.closeModal =
    closeModal;

window.askSuggestion =
    askSuggestion;

window.testAPI =
    testAPI;

window.runPrediction =
    runPrediction;

window.editProject =
    editProject;

window.deleteProject =
    deleteProject;

window.openAddProjectForm =
    openAddProjectForm;