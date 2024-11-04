function projects() {

    let project_content = '';
    $.getJSON('https://api.github.com/users/seechen/repos', function(my_projects) {

        my_projects = my_projects.filter(item => !item['fork']);
        my_projects.forEach(function(my_project) {

            project_content += `
            <div class="box_project">
                <p class="project_title">${my_project.name}</p>
                <p class="project_desc">${my_project.description ? my_project.description : 'No Description.'}</p>
                <p class="project_label">
                    ${my_project.topics.map(function(topic) {
                        return `<a href="https://github.com/topics/${topic}" target="blank">${topic}</a>`;
                    }).join(' ')}
                </p>
                <p class="project_language">
                    <span><img src="/MATERIALS/language/${my_project.language ? my_project.language : "1"}.png" alt="">${my_project.language ? my_project.language : "-"}</span>
                </p>
            </div>
            `
        })

        $('#projects_area').html(project_content);
    });
}