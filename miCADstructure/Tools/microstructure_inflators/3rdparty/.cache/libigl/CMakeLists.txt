# Distributed under the OSI-approved MIT License.  See accompanying
# file LICENSE or https://github.com/Crascit/DownloadProject for details.

cmake_minimum_required(VERSION 2.8.2)

project(libigl-download NONE)

include(ExternalProject)
ExternalProject_Add(libigl-download
                    GIT_CONFIG advice.detachedHead=false;GIT_REPOSITORY;https://github.com/libigl/libigl.git;GIT_TAG;75d60e40a8edc6868571fbdca2e74f97d5dddab8
                    SOURCE_DIR          "/mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/cmake/../3rdparty/libigl"
                    BINARY_DIR          "/mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/build/libigl-build"
                    CONFIGURE_COMMAND   ""
                    BUILD_COMMAND       ""
                    INSTALL_COMMAND     ""
                    TEST_COMMAND        ""
)
