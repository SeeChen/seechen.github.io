<div align=center>
<kbd>
<img src="/File/icon.png" height="125px"/>
</kbd></br>

# Self Learning

[Visit this Sites](#0-visit-my-sites)</br>
[Introduction](#1-introduction)</br>
[Features](#2-features)</br>
[Technology](#3-technology-used)</br>
[Sitemap](#4-sitemap)</br>
[Update Log](#5-update-log)</br>
[Acknowledgments](#6-acknowledgments)</br>
[License](#7-license)</br>

</div>

## 0. Visit My sites
> You can visit the site at [seechen.github.io](https://seechen.github.io).

## 1. Introduction
This website is hosted on Github Pages (github.io) and developed using HTML5 + CSS3 + Native JavaScript.

It is a Single Page Application (SPA), with all code available in the [Github repository](https://github.com/SeeChen/seechen.github.io/). All of the implementation has been independently completed by the author. While no open-source libraries were directly used, certain solutions were adapted from forum discussions and optimized for the website’s specific logic (some optimizations might still require refinement). Additionally, AI tools were occasionally leveraged to assist with code improvements and debugging.

The repository for this project was initially created on August 25, 2021, and has recently undergone significant updates.

This website serves as a personal challenge for the author to explore and understand modern JavaScript and CSS features. The current objective is to develop and maintain the entire website solely with native JavaScript and CSS, without relying on any frameworks or external libraries.

If you have any suggestions or ideas for improvement, please feel free to visit my Github repository and submit an [Issue](https://github.com/SeeChen/seechen.github.io/issues). Your feedback and support would be greatly appreciated!

## 2. Features
### 2.1 Multi-Language
> The site currently supports English and Chinese, with more languages to be added in the future.

### 2.2 Routing in Static Websites
> All access states are handled using route.js. This operation mimics the behavior of a back-end system.

***To view the currently assigned paths, check the [Sitemap](#4-sitemap).***

### 2.3 Pseudo Dynamic Website
> All data is stored as static files (e.g., JSON, TXT, etc.) in a GitHub repository. The content is fetched and parsed only when the relevant data is accessed, simulating a front-end and back-end interaction.

## 3. Technology Used
> This project utilizes several modern technologies to enhance performance and user experience. Below is a list of key technologies employed in the development of this static website.

### 3.1  Virtual DOM (虚拟 DOM)
The Virtual DOM is used to optimize the rendering process. It allows for a lightweight, in-memory representation of the UI, reducing the need for full-page reloads. By minimizing direct manipulation of the actual DOM, the performance is significantly improved. 

In this project, new content is fetched and compared with the old content to identify the differences (or "diffs"). Only the necessary changes are then rendered, reducing the overhead of directly manipulating the DOM and improving efficiency.

The related code can be found in [VirtualDOM.js](/JavaScript/General/VirtualDOM.js).

### 3.2 Event Bus (事件总线)
The Event Bus is used to manage communication between different components of the website. It provides a centralized system for emitting and listening to events across the entire application, which promotes a decoupled and scalable architecture.

Additionally, because this website uses the SPA (Single Page Application) model, without an Event Bus, managing all events directly can lead to excessive background listeners, which may degrade performance. By using the Event Bus, when switching between "different pages," events that no longer need to be listened to can be unsubscribed immediately, reducing performance overhead.

### 3.3 GPU Acceleration (GPU 加速)
By utilizing the `will-change` property in CSS, GPU acceleration allows the website to leverage hardware capabilities to render complex animations and graphics more efficiently. This results in smoother user interactions and improved visual performance, especially for intensive animations or transitions.

### 3.4 animation-timeline
The `animation-timeline` property allows for advanced sequencing of animations, providing precise control over the timing and order of visual effects. This capability helps create engaging and dynamic user experiences by allowing animations to be synchronized more effectively.

Compared to JavaScript-controlled animations, this feature is rendered directly by the browser’s rendering engine. As a result, the browser has more control over memory allocation and rendering processes, significantly improving animation performance without the need for JavaScript event listeners. This offloads animation handling to the browser’s optimized rendering pipeline, reducing performance overhead.

However, the main drawback of this property is that it is not yet fully supported across all browsers, leading to potential issues such as page crashes or visual inconsistencies in unsupported browsers.

### 3.5 @starting-style
The `@starting-style` directive is used to define the initial styles of elements before any transitions or animations occur. This ensures that elements have a well-defined starting state, preventing layout shifts or visual glitches during the animation sequence.

The advantages and disadvantages of this property are similar to those of the `animation-timeline` property, so they will not be discussed further here.

### 3.6 Pre-loading (资源预加载)
Pre-loading is used to load essential assets (such as images, fonts, and scripts) before they are requested by the user. This reduces waiting times and ensures a faster, smoother user experience, ultimately providing a higher-quality user interaction.

In the future, I'll optimizations for resource requests will be implemented to continue improving performance.

### 3.7 Event Delegation (事件委托)
In situations where multiple child elements need to listen for events, event delegation is used to attach a single event listener to the parent element. By checking `event.target`, the event can be triggered on the appropriate child element. This approach helps reduce the number of event listeners, minimizing memory usage and improving performance. As a result, it can help reduce the chances of lag or performance issues, particularly in cases with many child elements or dynamic content.

### 3.8 Routing in Static Sites (静态网站中的路由管理)
A routing system is used to manage different views or pages in a static website. Routing allows users to navigate between different parts of the site without reloading the entire page, enhancing the user experience with seamless transitions.

Using GitHub Pages’ rule for handling 404 errors, when a page is not found, GitHub will automatically redirect users to a custom `404.html` page if it exists. To achieve a similar effect for routing, you can create two identical HTML files: one named `index.html` and the other `404.html`. When a user tries to access a non-existent path, the `404.html` file will redirect to the route handler, allowing the user to reach the desired page without the need to create separate HTML files for every path. This approach ensures users are always directed to a valid route, except when a true 404 error occurs.

Unlike a real backend server, this method may result in noticeable 404 errors appearing in the browser console and network tab, as the browser still attempts to access the non-existent path before being redirected to the appropriate page.

***The `spa.html` file is not necessary for the current project. It was created during the transition to a Single Page Application (SPA) in order to maintain the functionality of the original project without disruption. Even after the full migration to SPA, this file remains as a symbolic reminder of the project's evolution.***

## 4. Sitemap
The currently accessible sitemaps are as follows:

seechen.github.io
### General Pages
- `/spa`
- `/spa.htm`
- `/spa.html`
- `/index`
- `/index.htm`
- `/index.html`
- `/home`
- `/home.htm`
- `/home.html`

### Travel Pages
- `/travel`
  - `/travel/{countryID}` (e.g., `/travel/CN` or `/travel/中国`)
    - `/travel/{countryID}/{provinceId}` (e.g., `/travel/CN/BeiJing` or `/travel/CN/北京`)

- `/travel.htm`
- `/travel.html`
- `/我的旅行`

**Pay Attention**
> The countryId and provinceId can only be accessed when I have traveled to those places. For example, you can't visit `https://seechen.github.io/travel/US` unless I've been to USA."

### Lens Pages
- `/lens`
- `/lens.htm`
- `/lens.html`

### Services Pages
- `/services`
- `/services.htm`
- `/services.html`

### Projects Pages
- `/projects`
- `/projects.htm`
- `/projects.html`
- `/project`
- `/project.htm`
- `/project.html`
- `/项目`
- `/我的项目`


## 5. Update Log
## 6. Acknowledgments
## 7. License

---
<div align="right">

###### *Last Modified by [SeeChen](https://github.com/SeeChen/) @ 06-NOV-2024 19:40 UTC +08:00*
</div>