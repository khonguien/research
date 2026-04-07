# Distributed under the OSI-approved MIT License.  See accompanying
# file LICENSE or https://github.com/Crascit/DownloadProject for details.

cmake_minimum_required(VERSION 2.8.2)

project(eigen-download NONE)

include(ExternalProject)
ExternalProject_Add(eigen-download
                    GIT_CONFIG advice.detachedHead=false;GIT_REPOSITORY;https://gitlab.com/libeigen/eigen.git;GIT_TAG;tags/3.4.0
                    SOURCE_DIR          "/mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/cmake/../3rdparty/eigen"
                    BINARY_DIR          "/mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/build/eigen-build"
                    CONFIGURE_COMMAND   ""
                    BUILD_COMMAND       ""
                    INSTALL_COMMAND     ""
                    TEST_COMMAND        ""
)
