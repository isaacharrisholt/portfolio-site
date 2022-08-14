export async function get() {
    const url_base: string | undefined = process.env.API_HOST;
    if (url_base === undefined) {
        throw new Error('API_HOST is not defined');
    }
    const [
        workExperienceData,
        projectsData,
    ] = await Promise.all([
        fetch(`${url_base}/work-experience`).then(res => res.json()),
        fetch(`${url_base}/personal-projects`).then(res => res.json()),
    ]);

    const workExperienceMessage = workExperienceData.message;

    // Sort work experience by start date descending
    workExperienceMessage.sort((a: { start_date: string; }, b: { start_date: string; }) => {
        if (a.start_date > b.start_date) {
            console.log(`${a.start_date} > ${b.start_date}`);
            return -1;
        } else if (a.start_date < b.start_date) {
            console.log(`${a.start_date} < ${b.start_date}`);
            return 1;
        } else {
            console.log(`${a.start_date} = ${b.start_date}`);
            return 0;
        }
    });
    console.log(workExperienceMessage);

    return {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        body: {
            workExperience: workExperienceMessage,
            projects: projectsData.message
        }
    };
}