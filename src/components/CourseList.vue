<template>
  <div class="course-list">
    <course-list-item
      v-for="course in courses"
      :key="course.id"
      :course="course"
    />
  </div>
</template>

<script>
import CourseListItem from '../components/CourseListItem';

export default {
  name: 'CourseList',

  components: {
    CourseListItem,
  },

  props: {
    courses: {
      type: Array,
      required: true,
    },
  },
};
</script>
