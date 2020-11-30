<template>
  <div class="app-sidebar">
    <ul class="app-sidebar__items">
      <li class="app-sidebar__items__item">
        <router-link :to="{ name: 'dashboard' }" class="app-sidebar__items__item--link">
          <div class="app-sidebar__items__item--link__icon">
            <font-awesome-icon :icon="coursesIcon" />
          </div>

          <div class="app-sidebar__items__item--link__text">
            Courses
          </div>
        </router-link>
      </li>

      <li class="app-sidebar__items__item">
        <router-link :to="{ name: 'downloads' }" class="app-sidebar__items__item--link">
          <div class="app-sidebar__items__item--link__icon">
            <font-awesome-icon :icon="downloadsIcon" />
          </div>

          <div class="app-sidebar__items__item--link__text">
            Downloads
          </div>
        </router-link>
      </li>

      <li class="app-sidebar__items__item">
        <router-link :to="{ name: 'settings' }" class="app-sidebar__items__item--link">
          <div class="app-sidebar__items__item--link__icon">
            <font-awesome-icon :icon="settingsIcon" />
          </div>

          <div class="app-sidebar__items__item--link__text">
            Settings
          </div>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
import { faCogs, faChalkboardTeacher, faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

export default {
  name: 'AppSidebar',

  components: {
    FontAwesomeIcon,
  },

  computed: {
    coursesIcon() {
      return faChalkboardTeacher;
    },
    downloadsIcon() {
      return faDownload;
    },
    settingsIcon() {
      return faCogs;
    },
  },
};
</script>

<style lang="scss">
  .app-sidebar {
    background-color: #201f1f;
    position: fixed;
    width: 70px;
    height: 100vh;
  }

  .app-sidebar__items {
    margin: 0;
    padding: 0;
    list-style: none;

    &__item {
      width: 100%;
      height: 70px;
      font-size: 0.70rem;

      &--link {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        height: 100%;
        color: #fff;
        text-decoration: none;
        text-align: center;

        &:hover {
          background-color: #ec5252;
          cursor: pointer;
        }

        &__icon {
          font-size: 1.2rem;
          margin-bottom: 5px;
        }
      }
    }
  }
</style>
