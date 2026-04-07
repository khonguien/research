# Distributed under the OSI-approved MIT License.  See accompanying
# file LICENSE or https://github.com/Crascit/DownloadProject for details.

cmake_minimum_required(VERSION 2.8.2)

project(triangle-download NONE)

include(ExternalProject)
ExternalProject_Add(triangle-download
                    GIT_CONFIG advice.detachedHead=false;GIT_REPOSITORY;https://github.com/Huangzizhou/triangle.git;GIT_TAG;c80ac9a5efd0c199d7cda4730489391f2ed40178
                    SOURCE_DIR          "/mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/cmake/../3rdparty/triangle"
                    BINARY_DIR          "/mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/build/triangle-build"
                    CONFIGURE_COMMAND   ""
                    BUILD_COMMAND       ""
                    INSTALL_COMMAND     ""
                    TEST_COMMAND        ""
)
