/**
 * @author Ryan Balieiro
 * @date 2025-05-10
 * @description This provider is responsible for loading and providing the data for the application.
 */

import React, {createContext, useContext, useEffect, useState} from 'react'
import {useUtils} from "/src/hooks/utils.js"

function DataProvider({ children, settings }) {
    const utils = useUtils()

    const DataProviderStatus = {
        STATUS_IDLE: "data_provider_status_idle",
        STATUS_PREPARING_FOR_LOADING: "data_provider_status_preparing_for_loading",
        STATUS_LOADING: "data_provider_status_loading",
        STATUS_LOADED: "data_provider_status_loaded",
        STATUS_EVALUATED: "data_provider_status_evaluated",
    }

    const [status, setStatus] = useState(DataProviderStatus.STATUS_IDLE)
    const [jsonData, setJsonData] = useState({})

    /** @constructs **/
    useEffect(() => {
        if(status !== DataProviderStatus.STATUS_IDLE)
            return

        setStatus(DataProviderStatus.STATUS_PREPARING_FOR_LOADING)
    }, [null])

    /** @listens DataProviderStatus.STATUS_PREPARING_FOR_LOADING **/
    useEffect(() => {
        if(status !== DataProviderStatus.STATUS_PREPARING_FOR_LOADING)
            return

        setJsonData({})

        setStatus(DataProviderStatus.STATUS_LOADING)
    }, [status === DataProviderStatus.STATUS_PREPARING_FOR_LOADING])

    /** @listens DataProviderStatus.STATUS_LOADING **/
    useEffect(() => {
        if(status !== DataProviderStatus.STATUS_LOADING)
            return

        _loadData().then(response => {
            setJsonData(response)
            setStatus(DataProviderStatus.STATUS_LOADED)
        }).catch(error => {
            console.error("DataProvider: Error loading data:", error)
            // Set empty data to allow app to continue
            setJsonData({
                strings: {},
                profile: {},
                settings: settings || {},
                sections: [],
                categories: []
            })
            setStatus(DataProviderStatus.STATUS_LOADED)
        })
    }, [status === DataProviderStatus.STATUS_LOADING])

    /** @listens DataProviderStatus.STATUS_LOADED **/
    useEffect(() => {
        if(status !== DataProviderStatus.STATUS_LOADED)
            return

        const validation = _validateData()
        if(!validation.success) {
            utils.log.throwError("DataProvider", validation.message)
            return
        }

        setStatus(DataProviderStatus.STATUS_EVALUATED)
    }, [status === DataProviderStatus.STATUS_LOADED])

    const _loadData = async () => {
        const jStrings = await utils.file.loadJSON("/data/strings.json") || {}
        const jProfile = await utils.file.loadJSON("/data/profile.json") || {}
        const jCategories = await utils.file.loadJSON("/data/categories.json") || { categories: [] }
        const jSections = await utils.file.loadJSON("/data/sections.json") || { sections: [] }

        const categories = jCategories.categories || []
        const sections = jSections.sections || []
        
        if (categories.length > 0 && sections.length > 0) {
            _bindCategoriesAndSections(categories, sections)
            await _loadSectionsData(sections)
        }

        return {
            strings: jStrings,
            profile: jProfile,
            settings: settings,
            sections: sections,
            categories: categories
        }
    }

    const _bindCategoriesAndSections = (categories, sections) => {
        for(const category of categories) {
            category.sections = []
        }

        for(const section of sections) {
            const sectionCategoryId = section["categoryId"]
            const sectionCategory = categories.find(category => category.id === sectionCategoryId)
            if(!sectionCategory) {
                utils.log.throwError("DataProvider", `Section with id "${section.id}" has invalid category id "${sectionCategoryId}". Make sure the category exists within categories.json`)
                return
            }

            sectionCategory.sections.push(section)
            section.category = sectionCategory
        }
    }

    const _loadSectionsData = async (sections) => {
        for(const section of sections) {
            const sectionJsonPath = section.jsonPath
            if(sectionJsonPath) {
                let jSectionData = {}

                try {
                    jSectionData = await utils.file.loadJSON(sectionJsonPath)
                } catch (e) {
                    jSectionData = {}
                }

                section.data = jSectionData
            }
        }
    }

    const _validateData = () => {
        const categories = jsonData.categories || []
        if (categories.length === 0) {
            console.warn("DataProvider: No categories loaded. The portfolio may not display correctly.")
            return {success: true} // Allow to continue even with empty data
        }
        
        const emptyCategories = categories.filter(category => (category.sections || []).length === 0)
        const emptyCategoriesIds = emptyCategories.map(category => category.id)
        if(emptyCategories.length > 0) {
            console.warn(`DataProvider: The following ${emptyCategories.length} categories are empty: "${emptyCategoriesIds}"`)
            // Don't block rendering, just warn
        }

        return {success: true}
    }

    const getProfile = () => {
        return jsonData?.profile || {}
    }

    const getSettings = () => {
        return jsonData?.settings || {}
    }

    const getStrings = () => {
        return jsonData?.strings || {}
    }

    const getSections = () => {
        return jsonData?.sections || []
    }

    const getCategories = () => {
        return jsonData?.categories || []
    }

    // Debug: Log status changes
    useEffect(() => {
        console.log(`DataProvider status: ${status}`)
        if (status === DataProviderStatus.STATUS_EVALUATED) {
            console.log("DataProvider: Data loaded successfully", {
                categories: jsonData.categories?.length || 0,
                sections: jsonData.sections?.length || 0
            })
        }
    }, [status])

        return (
        <DataContext.Provider value={{
            getProfile,
            getSettings,
            getStrings,
            getSections,
            getCategories
        }}>
            {status === DataProviderStatus.STATUS_EVALUATED ? (
                <>{children}</>
            ) : status === DataProviderStatus.STATUS_LOADING ? (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    backgroundColor: '#111111',
                    color: '#ffffff',
                    fontFamily: 'Arial, sans-serif'
                }}>
                    <div>
                        <div style={{ fontSize: '20px', marginBottom: '10px' }}>Loading portfolio data...</div>
                        <div style={{ fontSize: '12px', color: '#888' }}>Status: {status}</div>
                    </div>
                </div>
            ) : (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    backgroundColor: '#111111',
                    color: '#ffffff',
                    fontFamily: 'Arial, sans-serif'
                }}>
                    <div>
                        <div style={{ fontSize: '20px', marginBottom: '10px' }}>Initializing...</div>
                        <div style={{ fontSize: '12px', color: '#888' }}>Status: {status}</div>
                    </div>
                </div>
            )}
        </DataContext.Provider>
    )
}

const DataContext = createContext(null)
/**
 * @return {{
 *    getProfile: Function,
 *    getSettings: Function,
 *    getStrings: Function,
 *    getSections: Function,
 *    getCategories: Function
 * }}
 */
export const useData = () => useContext(DataContext)

export default DataProvider