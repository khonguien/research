# Distributed under the OSI-approved MIT License.  See accompanying
# file LICENSE or https://github.com/Crascit/DownloadProject for details.

cmake_minimum_required(VERSION 2.8.2)

project(CLI11-download NONE)

include(ExternalProject)
ExternalProject_Add(CLI11-download
                    GIT_CONFIG advice.detachedHead=false;URL;https://github.com/CLIUtils/CLI11/archive/v1.6.0.tar.gz;URL_MD5;c8e3dc70e3b7ebf6b01f618f7cdcc85f
                    SOURCE_DIR          "/mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/cmake/../3rdparty/CLI11"
                    BINARY_DIR          "/mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/build/CLI11-build"
                    CONFIGURE_COMMAND   ""
                    BUILD_COMMAND       ""
                    INSTALL_COMMAND     ""
                    TEST_COMMAND        ""
)
