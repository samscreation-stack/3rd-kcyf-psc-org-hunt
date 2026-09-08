/* =========================================================
   PUBLIC SPEAKING PROGRAMME
   Website functionality
   ========================================================= */


/* =========================================================
   1. GOOGLE APPS SCRIPT CONNECTION
   ========================================================= */

const SUBMISSION_ENDPOINT =
    "https://script.google.com/macros/s/AKfycbwukUbeWibJf6siOa5pn0tlp5IXXBbWZmWZqrhIPC7iBmvnVLAq35rPHFLcjgOgAvc/exec";


/* =========================================================
   2. GET FORM ELEMENTS
   ========================================================= */

const form = document.getElementById("applicationForm");

const photoInput = document.getElementById("photo");

const photoPreview = document.getElementById("photoPreview");

const previewImg = document.getElementById("previewImg");

const submitButton = document.getElementById("submitButton");

const statusBox = document.getElementById("statusBox");



/* =========================================================
   3. PHOTO PREVIEW
   ========================================================= */

if (photoInput) {

    photoInput.addEventListener("change", function () {

        const file = photoInput.files[0];


        /* Nothing selected */

        if (!file) {

            if (photoPreview) {
                photoPreview.classList.remove("visible");
            }

            return;
        }


        /* Check file type */

        if (!file.type.startsWith("image/")) {

            photoInput.value = "";

            showStatus(
                "Please select a valid image file.",
                "error"
            );

            return;
        }


        /* Check file size */

        const maxSize =
            2 * 1024 * 1024; // 2 MB

        if (file.size > maxSize) {

            photoInput.value = "";

            showStatus(
                "Your photo must be smaller than 2 MB.",
                "error"
            );

            return;
        }


        /* Create preview */

        const reader =
            new FileReader();


        reader.onload = function (event) {

            if (previewImg) {

                previewImg.src =
                    event.target.result;

            }

            if (photoPreview) {

                photoPreview.classList.add(
                    "visible"
                );

            }

        };


        reader.readAsDataURL(file);

    });

}

/* =========================================================
   EXPERIENCE — "NONE YET" EXCLUSIVE SELECTION
   ========================================================= */

const experienceCheckboxes = document.querySelectorAll(
    'input[name="experience"]'
);

const noneYetCheckbox = document.querySelector(
    'input[name="experience"][value="None yet"]'
);

if (experienceCheckboxes.length && noneYetCheckbox) {

    experienceCheckboxes.forEach(function (checkbox) {

        checkbox.addEventListener("change", function () {

            /* -----------------------------------------
               NONE YET SELECTED
               ----------------------------------------- */

            if (
                checkbox === noneYetCheckbox &&
                checkbox.checked
            ) {

                experienceCheckboxes.forEach(function (other) {

                    if (other !== noneYetCheckbox) {

                        other.checked = false;
                        other.disabled = true;

                    }

                });

            }


            /* -----------------------------------------
               NONE YET UNSELECTED
               ----------------------------------------- */

            else if (
                checkbox === noneYetCheckbox &&
                !checkbox.checked
            ) {

                experienceCheckboxes.forEach(function (other) {

                    if (other !== noneYetCheckbox) {

                        other.disabled = false;

                    }

                });

            }


            /* -----------------------------------------
               ANOTHER EXPERIENCE SELECTED
               ----------------------------------------- */

            else if (
                checkbox !== noneYetCheckbox &&
                checkbox.checked
            ) {

                noneYetCheckbox.checked = false;
                noneYetCheckbox.disabled = true;

            }


            /* -----------------------------------------
               OTHER EXPERIENCE UNSELECTED
               ----------------------------------------- */

            else {

                const hasOtherSelection =
                    Array.from(experienceCheckboxes)
                        .some(function (item) {

                            return (
                                item !== noneYetCheckbox &&
                                item.checked
                            );

                        });


                /*
                 * If no other experience remains selected,
                 * enable "None yet" again.
                 */

                if (!hasOtherSelection) {

                    noneYetCheckbox.disabled = false;

                }

            }

        });

    });

}



/* =========================================================
   4. STATUS MESSAGE
   ========================================================= */

function showStatus(message, type) {

    if (!statusBox) {
        return;
    }

    statusBox.textContent = message;

    statusBox.className =
        "status show " + type;

}


function clearStatus() {

    if (!statusBox) {
        return;
    }

    statusBox.textContent = "";

    statusBox.className =
        "status";

}



/* =========================================================
   5. VALIDATE FORM
   ========================================================= */

function validateForm() {

    if (!form) {
        return false;
    }


    let isValid = true;


    /* Find all required fields */

    const requiredFields =
        form.querySelectorAll("[required]");


    requiredFields.forEach(function (field) {

        const wrapper =
            field.closest(".field");


        let fieldIsValid = true;


        /* Checkbox */

        if (field.type === "checkbox") {

            fieldIsValid =
                field.checked;

        }


        /* File */

        else if (field.type === "file") {

            fieldIsValid =
                field.files &&
                field.files.length > 0;

        }


        /* Normal input */

        else {

            fieldIsValid =
                field.value.trim() !== "";

        }


        /* Email validation */

        if (
            fieldIsValid &&
            field.type === "email"
        ) {

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            fieldIsValid =
                emailPattern.test(
                    field.value.trim()
                );

        }


        /* Apply validation state */

        if (!fieldIsValid) {

            isValid = false;

            if (wrapper) {
                wrapper.classList.add(
                    "invalid"
                );
            }

        }

        else {

            if (wrapper) {
                wrapper.classList.remove(
                    "invalid"
                );
            }

        }

    });

const experienceSelected =
    document.querySelectorAll(
        'input[name="experience"]:checked'
    ).length > 0;

const experienceError =
    document.getElementById("experienceError");

if (!experienceSelected) {

    isValid = false;

    if (experienceError) {
        experienceError.style.display = "block";
    }

} else {

    if (experienceError) {
        experienceError.style.display = "none";
    }

}

    return isValid;
}



/* =========================================================
   6. CONVERT PHOTO TO BASE64
   ========================================================= */

function fileToBase64(file) {

    return new Promise(function (
        resolve,
        reject
    ) {

        if (!file) {

            resolve({
                data: "",
                name: "",
                type: ""
            });

            return;
        }


        const reader =
            new FileReader();


        reader.onload = function () {

            resolve({

                data: reader.result,

                name: file.name,

                type: file.type

            });

        };


        reader.onerror = function () {

            reject(
                new Error(
                    "Could not read the photo."
                )
            );

        };


        reader.readAsDataURL(file);

    });

}



/* =========================================================
   7. FORM SUBMISSION
   ========================================================= */

if (form) {

    form.addEventListener(
        "submit",
        async function (event) {

            /* Stop normal browser submission */

            event.preventDefault();


            clearStatus();


            /* Validate */

            const valid =
                validateForm();


            if (!valid) {

                showStatus(
                    "Please complete all required fields.",
                    "error"
                );


                form.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });


                return;
            }


            /* Honeypot */

            const honeypot =
                document.getElementById(
                    "website"
                );


            if (
                honeypot &&
                honeypot.value.trim() !== ""
            ) {

                return;
            }


            /* Disable button */

            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.textContent =
                    "Submitting…";

            }


            try {


                /* Get photo */

                const photoFile =
                    photoInput &&
                    photoInput.files
                        ? photoInput.files[0]
                        : null;


                const photo =
                    await fileToBase64(
                        photoFile
                    );


                /* Collect form information */

                const applicationData = {

                    name:
                        document
                            .getElementById("name")
                            .value
                            .trim(),

                    phone:
                        document
                            .getElementById("phone")
                            .value
                            .trim(),

                    email:
                        document
                            .getElementById("email")
                            .value
                            .trim(),

                    institution:
                        document
                            .getElementById("institution")
                            .value
                            .trim(),

                    location:
                        document
                            .getElementById("location")
                            .value
                            .trim(),

                    experience:
    Array.from(
        document.querySelectorAll(
            'input[name="experience"]:checked'
        )
    )
    .map(function (checkbox) {
        return checkbox.value;
    })
    .join(", "),

                    motivation:
                        document
                            .getElementById("motivation")
                            .value
                            .trim(),

                    availability:
                        document
                            .getElementById("availability")
                            .value
                            .trim(),

                    additionalInfo:
                        document
                            .getElementById("additionalInfo")
                            .value
                            .trim(),

                    imageData:
                        photo.data,

                    imageName:
                        photo.name,

                    imageType:
                        photo.type

                };


                /* =================================================
                   SEND TO GOOGLE APPS SCRIPT
                   ================================================= */

                await fetch(
                    SUBMISSION_ENDPOINT,
                    {

                        method: "POST",

                        mode: "no-cors",

                        headers: {
                            "Content-Type":
                                "application/x-www-form-urlencoded;charset=UTF-8"
                        },

                        body:
                            "data=" +
                            encodeURIComponent(
                                JSON.stringify(
                                    applicationData
                                )
                            )

                    }
                );


                /* =================================================
                   SAVE NAME FOR THANK-YOU PAGE
                   ================================================= */

                sessionStorage.setItem(
                    "ps_submission_name",
                    applicationData.name
                );


                /* =================================================
                   GO TO THANK-YOU PAGE
                   ================================================= */

                window.location.href =
                    "thank-you.html";


            }

            catch (error) {

                console.error(
                    "Submission error:",
                    error
                );


                showStatus(
                    "Something went wrong. Please try again.",
                    "error"
                );


                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Submit Application →";

                }

            }

        }
    );

}



/* =========================================================
   8. SHOW APPLICANT NAME ON THANK-YOU PAGE
   ========================================================= */

const thankName =
    document.getElementById(
        "thankName"
    );


if (thankName) {

    const submittedName =
        sessionStorage.getItem(
            "ps_submission_name"
        );


    if (submittedName) {

        thankName.textContent =
            ", " + submittedName;

    }

}