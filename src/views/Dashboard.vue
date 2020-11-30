<template>
  <div class="dashboard main-layout">
    <course-list :courses="courses" />
  </div>
</template>

<script>
import CourseList from '../components/CourseList';
import axios from '../plugins/axios';

export default {
  name: 'Dashboard',

  components: {
    CourseList,
  },

  data() {
    return {
      courses: [],
    };
  },

  async mounted() {
    await this.loadCourses();
  },

  methods: {
    async loadCourses() {
      const { data: response } = await axios.get(`users/me/subscribed-courses`);

      this.courses = response.results;
    },
  },
}
</script>

<style>
.dashboard {
  width: 100%;
}
</style>
